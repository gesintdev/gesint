-- Valor de salário na vaga de emprego (opcional).

ALTER TABLE job_vacancy
    ADD COLUMN IF NOT EXISTS salary NUMERIC(14, 2);

-- Espelha a coluna nos schemas tenant_* que já possuem job_vacancy.
DO $sync_job_vacancy_salary$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.job_vacancy', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS salary NUMERIC(14, 2)',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_job_vacancy_salary$;
