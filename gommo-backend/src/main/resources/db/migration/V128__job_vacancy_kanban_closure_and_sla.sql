-- Encerrados (ex-Reprovados), requisitos estruturados da vaga e SLA por etapa do kanban.

ALTER TABLE admission_process_kanban_column
    ADD COLUMN IF NOT EXISTS sla_enabled BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS sla_business_days INTEGER NOT NULL DEFAULT 5;

UPDATE admission_process_kanban_column
SET name = 'Encerrados',
    sla_enabled = false
WHERE LOWER(column_key) = 'rejected'
  AND status <> 'DELETED';

UPDATE admission_process_kanban_column
SET column_key = 'closed'
WHERE LOWER(column_key) = 'rejected'
  AND status <> 'DELETED';

INSERT INTO admission_process_kanban_column (code, column_key, name, color, display_order, system_column, sla_enabled)
SELECT COALESCE((SELECT MAX(code) FROM admission_process_kanban_column), 0) + 1,
       'closed', 'Encerrados', '#DC2626', 1000, true, false
WHERE NOT EXISTS (
    SELECT 1 FROM admission_process_kanban_column
    WHERE LOWER(column_key) = 'closed' AND status <> 'DELETED'
);

ALTER TABLE job_vacancy
    ADD COLUMN IF NOT EXISTS requirement_items JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE job_vacancy
SET requirement_items = COALESCE(
    (
        SELECT jsonb_agg(trimmed ORDER BY ord)
        FROM (
            SELECT trim(line) AS trimmed, row_number() OVER () AS ord
            FROM regexp_split_to_table(COALESCE(requirements, ''), E'[\\r\\n]+') AS line
            WHERE trim(line) <> ''
        ) parsed
    ),
    '[]'::jsonb
)
WHERE requirement_items = '[]'::jsonb
  AND requirements IS NOT NULL
  AND trim(requirements) <> '';

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS kanban_column_entered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS kanban_sla_last_reminder_date DATE;

UPDATE job_vacancy_application
SET kanban_column_key = 'closed'
WHERE LOWER(kanban_column_key) = 'rejected';

UPDATE job_vacancy_application
SET kanban_column_entered_at = COALESCE(updated_at, applied_at, created_at)
WHERE kanban_column_key IS NOT NULL
  AND kanban_column_key <> ''
  AND kanban_column_entered_at IS NULL;

DO $sync_v128$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.admission_process_kanban_column', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.admission_process_kanban_column '
                || 'ADD COLUMN IF NOT EXISTS sla_enabled BOOLEAN NOT NULL DEFAULT true, '
                || 'ADD COLUMN IF NOT EXISTS sla_business_days INTEGER NOT NULL DEFAULT 5',
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.admission_process_kanban_column
                SET name = 'Encerrados', sla_enabled = false
                WHERE LOWER(column_key) = 'rejected' AND status <> 'DELETED'
                $sql$,
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.admission_process_kanban_column
                SET column_key = 'closed'
                WHERE LOWER(column_key) = 'rejected' AND status <> 'DELETED'
                $sql$,
                target_schema);

            EXECUTE format(
                $sql$
                INSERT INTO %I.admission_process_kanban_column
                    (code, column_key, name, color, display_order, system_column, sla_enabled)
                SELECT COALESCE((SELECT MAX(code) FROM %I.admission_process_kanban_column), 0) + 1,
                       'closed', 'Encerrados', '#DC2626', 1000, true, false
                WHERE NOT EXISTS (
                    SELECT 1 FROM %I.admission_process_kanban_column
                    WHERE LOWER(column_key) = 'closed' AND status <> 'DELETED'
                )
                $sql$,
                target_schema,
                target_schema,
                target_schema);
        END IF;

        IF to_regclass(format('%I.job_vacancy', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy '
                || 'ADD COLUMN IF NOT EXISTS requirement_items JSONB NOT NULL DEFAULT ''[]''::jsonb',
                target_schema);
        END IF;

        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application '
                || 'ADD COLUMN IF NOT EXISTS kanban_column_entered_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS kanban_sla_last_reminder_date DATE',
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.job_vacancy_application
                SET kanban_column_key = 'closed'
                WHERE LOWER(kanban_column_key) = 'rejected'
                $sql$,
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.job_vacancy_application
                SET kanban_column_entered_at = COALESCE(updated_at, applied_at, created_at)
                WHERE kanban_column_key IS NOT NULL
                  AND kanban_column_key <> ''
                  AND kanban_column_entered_at IS NULL
                $sql$,
                target_schema);
        END IF;
    END LOOP;
END
$sync_v128$;

SELECT public.gommo_audit_sync_table('admission_process_kanban_column');
SELECT public.gommo_audit_sync_table('job_vacancy');
SELECT public.gommo_audit_sync_table('job_vacancy_application');
