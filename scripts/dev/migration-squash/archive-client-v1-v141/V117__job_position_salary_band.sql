-- RN-12: niveis e faixas salariais por cargo, com vigencia (mesmo principio da Matriz de Exames).

CREATE TABLE IF NOT EXISTS job_position_salary_band (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                INTEGER NOT NULL,
    status              gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id          UUID,
    job_position_id     UUID NOT NULL REFERENCES job_position (id),
    level_name          VARCHAR(80) NOT NULL,
    sort_order          INT NOT NULL DEFAULT 0,
    min_salary          NUMERIC(14, 2) NOT NULL,
    reference_salary    NUMERIC(14, 2) NOT NULL,
    max_salary          NUMERIC(14, 2) NOT NULL,
    version_number      INT NOT NULL DEFAULT 1,
    valid_from          DATE NOT NULL,
    valid_until         DATE,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_position_salary_band_code
    ON job_position_salary_band (code);

CREATE INDEX IF NOT EXISTS idx_job_position_salary_band_position
    ON job_position_salary_band (job_position_id, sort_order, valid_from)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_position_salary_band_company
    ON job_position_salary_band (company_id)
    WHERE status <> 'DELETED';

DO $sync_job_position_salary_band$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.job_position', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.job_position_salary_band', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_position_salary_band (LIKE public.job_position_salary_band INCLUDING ALL)',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_job_position_salary_band$;
