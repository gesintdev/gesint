-- RN-34 / RN-35 / RN-05: reprovacao com motivo no kanban da vaga.
--   admission_process_kanban_column.system_column : colunas do sistema nao podem ser excluidas,
--                                                    desativadas nem ter a chave alterada.
--   'rejected' (Reprovados)                        : coluna de sistema; so recebe cards pela
--                                                    reprovacao com motivo.
--   job_vacancy_application.rejection_*            : motivo, requisito, autor e status do retorno
--                                                    enviado ao candidato.

ALTER TABLE admission_process_kanban_column
    ADD COLUMN IF NOT EXISTS system_column BOOLEAN NOT NULL DEFAULT false;

UPDATE admission_process_kanban_column
SET system_column = true
WHERE LOWER(column_key) = 'rejected'
  AND status <> 'DELETED';

INSERT INTO admission_process_kanban_column (code, column_key, name, color, display_order, system_column)
SELECT COALESCE((SELECT MAX(code) FROM admission_process_kanban_column), 0) + 1,
       'rejected', 'Reprovados', '#DC2626', 1000, true
WHERE NOT EXISTS (
    SELECT 1 FROM admission_process_kanban_column
    WHERE LOWER(column_key) = 'rejected' AND status <> 'DELETED'
);

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(48),
    ADD COLUMN IF NOT EXISTS rejection_requirement VARCHAR(300),
    ADD COLUMN IF NOT EXISTS rejection_note TEXT,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_by UUID,
    ADD COLUMN IF NOT EXISTS rejected_by_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS rejection_feedback_status VARCHAR(16),
    ADD COLUMN IF NOT EXISTS rejection_feedback_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_feedback_detail VARCHAR(500);

DO $sync_application_rejection$
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
                || 'ADD COLUMN IF NOT EXISTS system_column BOOLEAN NOT NULL DEFAULT false',
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.admission_process_kanban_column
                SET system_column = true
                WHERE LOWER(column_key) = 'rejected'
                  AND status <> 'DELETED'
                $sql$,
                target_schema);

            EXECUTE format(
                $sql$
                INSERT INTO %I.admission_process_kanban_column
                    (code, column_key, name, color, display_order, system_column)
                SELECT COALESCE((SELECT MAX(code) FROM %I.admission_process_kanban_column), 0) + 1,
                       'rejected', 'Reprovados', '#DC2626', 1000, true
                WHERE NOT EXISTS (
                    SELECT 1 FROM %I.admission_process_kanban_column
                    WHERE LOWER(column_key) = 'rejected' AND status <> 'DELETED'
                )
                $sql$,
                target_schema,
                target_schema,
                target_schema);
        END IF;

        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application '
                || 'ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(48), '
                || 'ADD COLUMN IF NOT EXISTS rejection_requirement VARCHAR(300), '
                || 'ADD COLUMN IF NOT EXISTS rejection_note TEXT, '
                || 'ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS rejected_by UUID, '
                || 'ADD COLUMN IF NOT EXISTS rejected_by_name VARCHAR(200), '
                || 'ADD COLUMN IF NOT EXISTS rejection_feedback_status VARCHAR(16), '
                || 'ADD COLUMN IF NOT EXISTS rejection_feedback_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS rejection_feedback_detail VARCHAR(500)',
                target_schema);
        END IF;
    END LOOP;
END
$sync_application_rejection$;

SELECT public.gommo_audit_sync_table('admission_process_kanban_column');
SELECT public.gommo_audit_sync_table('job_vacancy_application');
