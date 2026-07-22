ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS stage_comments JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Espelha a coluna nos schemas tenant_* existentes.
DO $sync_job_vacancy_application_stage_comments$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS stage_comments JSONB NOT NULL DEFAULT ''{}''::jsonb',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_job_vacancy_application_stage_comments$;
