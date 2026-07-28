-- Análise de currículo por IA + pretensão salarial na candidatura.

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS salary_expectation NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS ai_score NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS ai_status VARCHAR(32),
    ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

DO $sync_application_ai_fields$
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
                'ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS salary_expectation NUMERIC(14, 2)',
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS ai_score NUMERIC(5, 2)',
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS ai_status VARCHAR(32)',
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ',
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application ADD COLUMN IF NOT EXISTS ai_analysis JSONB',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_application_ai_fields$;
