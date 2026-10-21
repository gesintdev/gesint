-- Trilha de auditoria (RN-05 · D7): ativa audit_log (existia vazia desde a V1).
--
-- Cada linha e um evento imutavel: acao (AuditActionEnum), categoria (AuditCategoryEnum),
-- registro afetado, detalhe, motivo, usuario, IP e filial. O historico campo a campo continua
-- no Envers (revinfo + *_aud); a trilha registra o "quem fez o que" consultavel pelo Auditor.
--
-- Consulta: permissao audit:read (modulo audit, CFG). Fica fora do Administrador CFG
-- (so GLOBAL_ADMIN e o perfil Auditor), por isso o modulo nao entra em
-- gesint_admin_profile_modules().

CREATE OR REPLACE FUNCTION public.gesint_audit_log_trail_columns(p_schema text)
RETURNS void
LANGUAGE plpgsql
AS $fn$
BEGIN
    IF to_regclass(format('%I.audit_log', p_schema)) IS NULL THEN
        RETURN;
    END IF;

    EXECUTE format(
        $sql$
        ALTER TABLE %I.audit_log
            ALTER COLUMN entity_id DROP NOT NULL,
            ALTER COLUMN action TYPE VARCHAR(40),
            ADD COLUMN IF NOT EXISTS category VARCHAR(30),
            ADD COLUMN IF NOT EXISTS record_label VARCHAR(200),
            ADD COLUMN IF NOT EXISTS detail VARCHAR(500),
            ADD COLUMN IF NOT EXISTS reason TEXT
        $sql$,
        p_schema);

    EXECUTE format(
        'UPDATE %I.audit_log SET category = ''RECORD'' WHERE category IS NULL',
        p_schema);
    EXECUTE format('ALTER TABLE %I.audit_log ALTER COLUMN category SET NOT NULL', p_schema);

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_audit_log_occurred_at ON %I.audit_log (occurred_at DESC)',
        p_schema);
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_audit_log_category_occurred_at ON %I.audit_log (category, occurred_at DESC)',
        p_schema);
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_audit_log_user ON %I.audit_log (user_id)',
        p_schema);
END
$fn$;

SELECT public.gesint_audit_log_trail_columns('public');

-- Permissao de consulta.
INSERT INTO permission (id, code, module, authority, description) VALUES
    ('56000000-0000-0000-0000-000000000001', 10052, 'audit', 'audit:read', 'Consultar trilha de auditoria')
ON CONFLICT (id) DO NOTHING;

INSERT INTO permission (id, code, module, authority, description)
SELECT gen_random_uuid(), 10052, 'audit', 'audit:read', 'Consultar trilha de auditoria'
WHERE NOT EXISTS (
    SELECT 1 FROM permission p WHERE p.authority = 'audit:read'
);

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE authority = 'audit:read'
ON CONFLICT DO NOTHING;

-- Perfil Auditor (matriz RN-03 v1.2): le a trilha e a configuracao de acesso, sem editar.
-- CUSTOM (atribuivel a usuarios); o cliente pode ajustar como qualquer perfil proprio.
CREATE OR REPLACE FUNCTION public.gesint_seed_auditor_profile(p_schema text)
RETURNS void
LANGUAGE plpgsql
AS $fn$
BEGIN
    IF to_regclass(format('%I.role', p_schema)) IS NULL
       OR to_regclass(format('%I.permission', p_schema)) IS NULL
       OR to_regclass(format('%I.role_permission', p_schema)) IS NULL THEN
        RETURN;
    END IF;

    EXECUTE format(
        $sql$
        INSERT INTO %I.permission (id, code, authority, module, description)
        SELECT p.id, p.code, p.authority, p.module, p.description
        FROM public.permission p
        WHERE p.authority = 'audit:read'
        ON CONFLICT DO NOTHING
        $sql$,
        p_schema);

    EXECUTE format(
        $sql$
        INSERT INTO %I.role_permission (role_id, permission_id)
        SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
        FROM %I.permission p
        WHERE p.authority = 'audit:read'
          AND EXISTS (SELECT 1 FROM %I.role r WHERE r.id = '00000000-0000-0000-0000-000000000001')
        ON CONFLICT DO NOTHING
        $sql$,
        p_schema, p_schema, p_schema);

    EXECUTE format(
        $sql$
        INSERT INTO %I.role (id, code, name, description, system, status, is_system, role_type, created_at)
        SELECT
            '56000000-0000-0000-0000-000000000100'::uuid,
            COALESCE((SELECT MAX(code) FROM %I.role), 0) + 1,
            'Auditor',
            'Consulta a trilha de auditoria e a configuracao de acesso, sem editar.',
            'CFG',
            'ACTIVE',
            false,
            'CUSTOM',
            now()
        ON CONFLICT DO NOTHING
        $sql$,
        p_schema, p_schema);

    EXECUTE format(
        $sql$
        INSERT INTO %I.role_permission (role_id, permission_id)
        SELECT r.id, p.id
        FROM %I.role r
        CROSS JOIN %I.permission p
        WHERE r.id = '56000000-0000-0000-0000-000000000100'
          AND p.authority IN ('audit:read', 'role:read', 'actingprofile:read', 'user:read')
        ON CONFLICT DO NOTHING
        $sql$,
        p_schema, p_schema, p_schema);
END
$fn$;

SELECT public.gesint_seed_auditor_profile('public');

DO $sync_audit_trail$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND (to_regclass(format('%I.audit_log', n.nspname)) IS NOT NULL
               OR to_regclass(format('%I.permission', n.nspname)) IS NOT NULL)
        ORDER BY 1
    LOOP
        PERFORM public.gesint_audit_log_trail_columns(target_schema);
        PERFORM public.gesint_seed_auditor_profile(target_schema);
    END LOOP;
END
$sync_audit_trail$;
