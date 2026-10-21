-- T13: aceite da proposta no portal + pré-admissão self-serve (sem eSocial).
-- acceptance_channel já é VARCHAR — valor PORTAL é só enum Java.
-- PCD autodeclaração fica na admissão (fora do kanban de entrevista).

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS offer_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS offer_contract_type VARCHAR(32),
    ADD COLUMN IF NOT EXISTS offer_base_salary NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS offer_expected_start_date DATE,
    ADD COLUMN IF NOT EXISTS offer_experience_period VARCHAR(32),
    ADD COLUMN IF NOT EXISTS offer_work_schedule_id UUID,
    ADD COLUMN IF NOT EXISTS offer_decline_reason VARCHAR(500);

ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10),
    ADD COLUMN IF NOT EXISTS bank_agency VARCHAR(20),
    ADD COLUMN IF NOT EXISTS bank_account VARCHAR(30),
    ADD COLUMN IF NOT EXISTS bank_account_digit VARCHAR(5),
    ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS pix_key VARCHAR(120),
    ADD COLUMN IF NOT EXISTS pre_admission_token VARCHAR(64),
    ADD COLUMN IF NOT EXISTS pre_admission_token_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS pre_admission_link_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS pre_admission_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS pcd_self_declared BOOLEAN,
    ADD COLUMN IF NOT EXISTS pcd_self_declared_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS ux_admission_process_pre_admission_token
    ON admission_process (pre_admission_token)
    WHERE pre_admission_token IS NOT NULL AND status <> 'DELETED';

DO $sync_v139$
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
                || 'ADD COLUMN IF NOT EXISTS offer_sent_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS offer_contract_type VARCHAR(32), '
                || 'ADD COLUMN IF NOT EXISTS offer_base_salary NUMERIC(14, 2), '
                || 'ADD COLUMN IF NOT EXISTS offer_expected_start_date DATE, '
                || 'ADD COLUMN IF NOT EXISTS offer_experience_period VARCHAR(32), '
                || 'ADD COLUMN IF NOT EXISTS offer_work_schedule_id UUID, '
                || 'ADD COLUMN IF NOT EXISTS offer_decline_reason VARCHAR(500)',
                target_schema);
        END IF;
        IF to_regclass(format('%I.admission_process', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.admission_process '
                || 'ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10), '
                || 'ADD COLUMN IF NOT EXISTS bank_agency VARCHAR(20), '
                || 'ADD COLUMN IF NOT EXISTS bank_account VARCHAR(30), '
                || 'ADD COLUMN IF NOT EXISTS bank_account_digit VARCHAR(5), '
                || 'ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(20), '
                || 'ADD COLUMN IF NOT EXISTS pix_key VARCHAR(120), '
                || 'ADD COLUMN IF NOT EXISTS pre_admission_token VARCHAR(64), '
                || 'ADD COLUMN IF NOT EXISTS pre_admission_token_expires_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS pre_admission_link_sent_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS pre_admission_completed_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS pcd_self_declared BOOLEAN, '
                || 'ADD COLUMN IF NOT EXISTS pcd_self_declared_at TIMESTAMPTZ',
                target_schema);
            EXECUTE format(
                'CREATE UNIQUE INDEX IF NOT EXISTS ux_admission_process_pre_admission_token '
                || 'ON %I.admission_process (pre_admission_token) '
                || 'WHERE pre_admission_token IS NOT NULL AND status <> ''DELETED''',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v139$;

SELECT public.gesint_audit_sync_table('job_vacancy_application');
SELECT public.gesint_audit_sync_table('admission_process');
