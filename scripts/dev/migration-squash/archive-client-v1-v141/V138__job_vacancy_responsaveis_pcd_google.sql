-- T8 / RN-31·RN-32: responsáveis da vaga, afirmativa/PCD, Google for Jobs e SLA de retorno.

ALTER TABLE job_vacancy
    ADD COLUMN IF NOT EXISTS recruiter_collaborator_id UUID,
    ADD COLUMN IF NOT EXISTS requesting_manager_collaborator_id UUID,
    ADD COLUMN IF NOT EXISTS interviewer_collaborator_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS candidate_return_sla_business_days INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN IF NOT EXISTS affirmative_pcd BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS publish_google_jobs BOOLEAN NOT NULL DEFAULT true;

DO $sync_v138$
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
        IF to_regclass(format('%I.job_vacancy', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy '
                || 'ADD COLUMN IF NOT EXISTS recruiter_collaborator_id UUID, '
                || 'ADD COLUMN IF NOT EXISTS requesting_manager_collaborator_id UUID, '
                || 'ADD COLUMN IF NOT EXISTS interviewer_collaborator_ids JSONB NOT NULL DEFAULT ''[]''::jsonb, '
                || 'ADD COLUMN IF NOT EXISTS candidate_return_sla_business_days INTEGER NOT NULL DEFAULT 5, '
                || 'ADD COLUMN IF NOT EXISTS affirmative_pcd BOOLEAN NOT NULL DEFAULT false, '
                || 'ADD COLUMN IF NOT EXISTS publish_google_jobs BOOLEAN NOT NULL DEFAULT true',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v138$;

SELECT public.gesint_audit_sync_table('job_vacancy');
