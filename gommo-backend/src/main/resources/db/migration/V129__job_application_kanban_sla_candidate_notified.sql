-- Controle do e-mail "seu processo segue em analise" quando o SLA da etapa estoura.

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS kanban_sla_candidate_notified_at TIMESTAMPTZ;

DO $sync_v129$
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
        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application '
                || 'ADD COLUMN IF NOT EXISTS kanban_sla_candidate_notified_at TIMESTAMPTZ',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v129$;

SELECT public.gommo_audit_sync_table('job_vacancy_application');
