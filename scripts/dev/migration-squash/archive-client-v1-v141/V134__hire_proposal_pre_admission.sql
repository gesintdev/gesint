-- RN-37/38: proposta de contratacao (aceite manual) + valor do enum Pre-admissao.
-- IMPORTANTE: ADD VALUE nao pode ser usado na mesma transacao. O uso fica em V135.

ALTER TYPE gesint_types.admission_step_key_enum ADD VALUE IF NOT EXISTS 'PRE_ADMISSAO' BEFORE 'DOCUMENTACAO';

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS candidate_acceptance VARCHAR(32),
    ADD COLUMN IF NOT EXISTS acceptance_date DATE,
    ADD COLUMN IF NOT EXISTS acceptance_channel VARCHAR(32);

DO $sync_v134$
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
        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application '
                || 'ADD COLUMN IF NOT EXISTS candidate_acceptance VARCHAR(32), '
                || 'ADD COLUMN IF NOT EXISTS acceptance_date DATE, '
                || 'ADD COLUMN IF NOT EXISTS acceptance_channel VARCHAR(32)',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v134$;

SELECT public.gesint_audit_sync_table('job_vacancy_application');
