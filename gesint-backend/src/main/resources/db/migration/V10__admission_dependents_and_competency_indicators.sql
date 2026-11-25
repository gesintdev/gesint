-- Dependentes na admissao (JSON, mesmo padrao de emergency_contacts).
ALTER TABLE public.admission_process
    ADD COLUMN IF NOT EXISTS dependents jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Indicadores por nivel no catalogo de competencia (ordem 1..4 -> texto).
ALTER TABLE public.competency
    ADD COLUMN IF NOT EXISTS level_indicators jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.admission_process', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.admission_process ADD COLUMN IF NOT EXISTS dependents jsonb NOT NULL DEFAULT ''[]''::jsonb',
            tenant_schema
        );
        IF to_regclass(format('%I.competency', tenant_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.competency ADD COLUMN IF NOT EXISTS level_indicators jsonb NOT NULL DEFAULT ''{}''::jsonb',
                tenant_schema
            );
        END IF;
    END LOOP;
END
$$;

SELECT public.gesint_audit_sync_table('admission_process');
SELECT public.gesint_audit_sync_table('competency');
