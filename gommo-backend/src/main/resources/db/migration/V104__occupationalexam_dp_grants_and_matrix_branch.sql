-- Producao: alinhar permissoes occupationalexam (DP) + escopo filial da matriz.
-- 1) Revoga Admin RH em todos os tenants (V100 so cobriu public).
-- 2) Move perfil SESMT de RH para DP (menu/clinicas ficam no rail DP).
-- 3) company_id em exam_requirement (catalogo, espelha cargo).

-- ── Permissoes / SESMT ──────────────────────────────────────────────
DO $fix_occupationalexam_grants$
DECLARE
    target_schema text;
    schemas text[] := ARRAY['public'];
    sch text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        schemas := array_append(schemas, target_schema);
    END LOOP;

    FOREACH sch IN ARRAY schemas LOOP
        -- Remove occupationalexam do Administrador RH
        IF to_regclass(format('%I.role_permission', sch)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                DELETE FROM %I.role_permission rp
                USING %I.role r, %I.permission p
                WHERE rp.role_id = r.id
                  AND rp.permission_id = p.id
                  AND r.id = '00000000-0000-0000-0000-000000000102'
                  AND r.system = 'RH'
                  AND r.role_type = 'ADMIN'
                  AND p.module = 'occupationalexam'
                $sql$,
                sch, sch, sch
            );
        END IF;

        -- SESMT: sistema RH -> DP (se existir)
        IF to_regclass(format('%I.role', sch)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                UPDATE %I.role
                SET system = 'DP'
                WHERE lower(name) = lower('SESMT')
                  AND system = 'RH'
                  AND status <> 'DELETED'
                $sql$,
                sch
            );
        END IF;
    END LOOP;
END
$fix_occupationalexam_grants$;

-- Re-sincroniza Administrador DP (inclui occupationalexam via gommo_admin_profile_modules).
SELECT public.gommo_sync_admin_profile_permissions();

-- ── Matriz: company_id (catalogo) ───────────────────────────────────
ALTER TABLE exam_requirement ADD COLUMN IF NOT EXISTS company_id UUID;

UPDATE exam_requirement er
SET company_id = jp.company_id
FROM job_position jp
WHERE er.job_position_id = jp.id
  AND er.company_id IS DISTINCT FROM jp.company_id;

CREATE INDEX IF NOT EXISTS idx_exam_requirement_company
    ON exam_requirement (company_id);

DO $sync_exam_requirement_company$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.exam_requirement', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = target_schema
              AND table_name = 'exam_requirement'
              AND column_name = 'company_id'
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.exam_requirement ADD COLUMN company_id UUID',
                target_schema
            );
        END IF;

        EXECUTE format(
            $sql$
            UPDATE %I.exam_requirement er
            SET company_id = jp.company_id
            FROM %I.job_position jp
            WHERE er.job_position_id = jp.id
              AND er.company_id IS DISTINCT FROM jp.company_id
            $sql$,
            target_schema,
            target_schema
        );

        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS idx_exam_requirement_company ON %I.exam_requirement (company_id)',
            target_schema
        );
    END LOOP;
END
$sync_exam_requirement_company$;
