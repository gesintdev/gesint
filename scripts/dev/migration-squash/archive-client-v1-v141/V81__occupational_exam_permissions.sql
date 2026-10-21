-- Permissoes do modulo de Exames Ocupacionais.
-- Excecao justificada (LGPD): autoridade extra occupationalexam:clinical para
-- dado clinico (CID, observacoes, resultado de complementares), alem de
-- read/write/delete. Perfil padrao HR NAO recebe clinical.

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('49000000-0000-0000-0000-000000000001', 9901, 'occupationalexam', 'occupationalexam:read', 'Visualizar exames ocupacionais e cadastros auxiliares'),
    ('49000000-0000-0000-0000-000000000002', 9902, 'occupationalexam', 'occupationalexam:write', 'Criar e editar exames ocupacionais e cadastros auxiliares'),
    ('49000000-0000-0000-0000-000000000003', 9903, 'occupationalexam', 'occupationalexam:delete', 'Excluir exames ocupacionais e cadastros auxiliares'),
    ('49000000-0000-0000-0000-000000000004', 9904, 'occupationalexam', 'occupationalexam:clinical', 'Visualizar dados clinicos sensiveis de exames ocupacionais (LGPD)')
ON CONFLICT (id) DO NOTHING;

-- ADMIN recebe tudo (incluindo clinical).
INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'occupationalexam'
ON CONFLICT DO NOTHING;

-- HR operacional: read/write, SEM clinical e SEM delete.
INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module = 'occupationalexam'
  AND authority IN ('occupationalexam:read', 'occupationalexam:write')
ON CONFLICT DO NOTHING;

-- Role exemplo Saude Ocupacional / SESMT: clinical + read/write, sem delete.
INSERT INTO role (id, code, name, description, system, status, is_system)
SELECT
    '00000000-0000-0000-0000-000000000004',
    COALESCE((SELECT MAX(code) FROM role), 0) + 1,
    'SESMT',
    'Saude Ocupacional / SESMT - acesso a dados clinicos de exames',
    'RH',
    'ACTIVE',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM role WHERE lower(name) = lower('SESMT') AND system = 'RH' AND status <> 'DELETED'
);

INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r
JOIN permission p ON p.module = 'occupationalexam'
    AND p.authority IN (
        'occupationalexam:read',
        'occupationalexam:write',
        'occupationalexam:clinical'
    )
WHERE r.name = 'SESMT' AND r.system = 'RH' AND r.status <> 'DELETED'
ON CONFLICT DO NOTHING;

-- Espelha permissoes/roles nos schemas tenant_* existentes.
DO $sync_occupational_exam_permissions$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.permission (id, code, authority, module, description)
                SELECT p.id, p.code, p.authority, p.module, p.description
                FROM public.permission p
                WHERE p.module = 'occupationalexam'
                ON CONFLICT (id) DO NOTHING
                $sql$,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.role', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role (id, code, name, description, system, status, is_system)
                SELECT r.id, r.code, r.name, r.description, r.system, r.status, r.is_system
                FROM public.role r
                WHERE r.name = 'SESMT' AND r.system = 'RH'
                ON CONFLICT (id) DO NOTHING
                $sql$,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT rp.role_id, rp.permission_id
                FROM public.role_permission rp
                INNER JOIN public.permission p ON p.id = rp.permission_id
                WHERE p.module = 'occupationalexam'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema
            );

            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.module = 'occupationalexam'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_occupational_exam_permissions$;
