ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS kanban_column_key VARCHAR(80);

CREATE INDEX IF NOT EXISTS idx_job_vacancy_application_kanban_column
    ON job_vacancy_application (kanban_column_key)
    WHERE status <> 'DELETED' AND kanban_column_key IS NOT NULL;

-- Espelha a coluna nos schemas tenant_* existentes.
DO $sync_job_vacancy_application_kanban$
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
                'ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS kanban_column_key VARCHAR(80)',
                target_schema
            );
            EXECUTE format(
                $sql$
                CREATE INDEX IF NOT EXISTS idx_job_vacancy_application_kanban_column
                    ON %I.job_vacancy_application (kanban_column_key)
                    WHERE status <> 'DELETED' AND kanban_column_key IS NOT NULL
                $sql$,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_job_vacancy_application_kanban$;
