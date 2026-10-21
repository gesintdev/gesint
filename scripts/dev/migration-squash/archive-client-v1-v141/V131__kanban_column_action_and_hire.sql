-- RN-37/38: acao configuravel na coluna do kanban + vinculo candidatura <-> admissao.

ALTER TABLE admission_process_kanban_column
    ADD COLUMN IF NOT EXISTS column_action VARCHAR(40) NOT NULL DEFAULT 'NONE';

UPDATE admission_process_kanban_column
SET column_action = 'CREATE_ADMISSION'
WHERE LOWER(column_key) = 'hiring'
  AND status <> 'DELETED';

UPDATE admission_process_kanban_column
SET column_action = 'NONE'
WHERE system_column = true
  AND status <> 'DELETED';

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS admission_process_id UUID;

ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS source_application_id UUID,
    ADD COLUMN IF NOT EXISTS source_candidate_id UUID;

ALTER TABLE admission_process
    ALTER COLUMN birth_date DROP NOT NULL;

ALTER TABLE collaborator
    ALTER COLUMN birth_date DROP NOT NULL;

DO $sync_v131$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.admission_process_kanban_column', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.admission_process_kanban_column '
                || 'ADD COLUMN IF NOT EXISTS column_action VARCHAR(40) NOT NULL DEFAULT ''NONE''',
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.admission_process_kanban_column
                SET column_action = 'CREATE_ADMISSION'
                WHERE LOWER(column_key) = 'hiring' AND status <> 'DELETED'
                $sql$,
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.admission_process_kanban_column
                SET column_action = 'NONE'
                WHERE system_column = true AND status <> 'DELETED'
                $sql$,
                target_schema);
        END IF;

        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application '
                || 'ADD COLUMN IF NOT EXISTS admission_process_id UUID',
                target_schema);
        END IF;

        IF to_regclass(format('%I.admission_process', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.admission_process '
                || 'ADD COLUMN IF NOT EXISTS source_application_id UUID, '
                || 'ADD COLUMN IF NOT EXISTS source_candidate_id UUID',
                target_schema);
            EXECUTE format(
                'ALTER TABLE %I.admission_process ALTER COLUMN birth_date DROP NOT NULL',
                target_schema);
        END IF;

        IF to_regclass(format('%I.collaborator', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.collaborator ALTER COLUMN birth_date DROP NOT NULL',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v131$;

SELECT public.gesint_audit_sync_table('admission_process_kanban_column');
SELECT public.gesint_audit_sync_table('job_vacancy_application');
SELECT public.gesint_audit_sync_table('admission_process');
SELECT public.gesint_audit_sync_table('collaborator');
