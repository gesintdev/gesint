-- Campos extras da vaga (página pública) + perfil do candidato + candidatura.

ALTER TABLE job_vacancy
    ADD COLUMN IF NOT EXISTS department VARCHAR(200),
    ADD COLUMN IF NOT EXISTS location VARCHAR(200),
    ADD COLUMN IF NOT EXISTS work_modality VARCHAR(32),
    ADD COLUMN IF NOT EXISTS contract_type VARCHAR(32),
    ADD COLUMN IF NOT EXISTS work_schedule VARCHAR(80),
    ADD COLUMN IF NOT EXISTS salary_max NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS requirements TEXT,
    ADD COLUMN IF NOT EXISTS benefits TEXT;

ALTER TABLE candidate
    ADD COLUMN IF NOT EXISTS city VARCHAR(120),
    ADD COLUMN IF NOT EXISTS state_code VARCHAR(2),
    ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(300),
    ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(300);

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS cover_letter TEXT,
    ADD COLUMN IF NOT EXISTS referral_source VARCHAR(80);

DO $sync_careers_form_fields$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.job_vacancy', target_schema)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS department VARCHAR(200)', target_schema);
            EXECUTE format('ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS location VARCHAR(200)', target_schema);
            EXECUTE format('ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS work_modality VARCHAR(32)', target_schema);
            EXECUTE format('ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS contract_type VARCHAR(32)', target_schema);
            EXECUTE format('ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS work_schedule VARCHAR(80)', target_schema);
            EXECUTE format('ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS salary_max NUMERIC(14, 2)', target_schema);
            EXECUTE format('ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS requirements TEXT', target_schema);
            EXECUTE format('ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS benefits TEXT', target_schema);
        END IF;

        IF to_regclass(format('%I.candidate', target_schema)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I.candidate ADD COLUMN IF NOT EXISTS city VARCHAR(120)', target_schema);
            EXECUTE format('ALTER TABLE %I.candidate ADD COLUMN IF NOT EXISTS state_code VARCHAR(2)', target_schema);
            EXECUTE format('ALTER TABLE %I.candidate ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(300)', target_schema);
            EXECUTE format('ALTER TABLE %I.candidate ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(300)', target_schema);
        END IF;

        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS cover_letter TEXT', target_schema);
            EXECUTE format('ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS referral_source VARCHAR(80)', target_schema);
        END IF;
    END LOOP;
END
$sync_careers_form_fields$;
