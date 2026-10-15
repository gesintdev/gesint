-- RN-36: recomendação no scorecard + pergunta-guia da competência (RN-10).

ALTER TABLE job_application_interview_evaluation
    ADD COLUMN IF NOT EXISTS recommendation VARCHAR(40);

ALTER TABLE competency
    ADD COLUMN IF NOT EXISTS interview_guide_question TEXT;

DO $sync_v137$
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
        IF to_regclass(format('%I.job_application_interview_evaluation', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_application_interview_evaluation '
                || 'ADD COLUMN IF NOT EXISTS recommendation VARCHAR(40)',
                target_schema);
        END IF;

        IF to_regclass(format('%I.competency', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.competency ADD COLUMN IF NOT EXISTS interview_guide_question TEXT',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v137$;

SELECT public.gommo_audit_sync_table('job_application_interview_evaluation');
SELECT public.gommo_audit_sync_table('competency');
