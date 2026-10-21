-- RN-12: tabela salarial do cargo (vigencia na tabela) + itens por nivel I/II/III.

CREATE TABLE IF NOT EXISTS job_position_salary_table (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                INTEGER NOT NULL,
    status              gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id          UUID,
    job_position_id     UUID NOT NULL REFERENCES job_position (id),
    name                VARCHAR(120),
    version_number      INT NOT NULL DEFAULT 1,
    valid_from          DATE NOT NULL,
    valid_until         DATE,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_position_salary_table_code
    ON job_position_salary_table (code);

CREATE INDEX IF NOT EXISTS idx_job_position_salary_table_position
    ON job_position_salary_table (job_position_id, valid_from)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_position_salary_table_company
    ON job_position_salary_table (company_id)
    WHERE status <> 'DELETED';

CREATE TABLE IF NOT EXISTS job_position_salary_table_item (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_table_id     UUID NOT NULL REFERENCES job_position_salary_table (id) ON DELETE CASCADE,
    level               gesint_types.job_position_salary_level_enum NOT NULL,
    min_salary          NUMERIC(14, 2) NOT NULL,
    reference_salary    NUMERIC(14, 2) NOT NULL,
    max_salary          NUMERIC(14, 2) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_position_salary_table_item_level
    ON job_position_salary_table_item (salary_table_id, level);

CREATE INDEX IF NOT EXISTS idx_job_position_salary_table_item_table
    ON job_position_salary_table_item (salary_table_id);

-- Migra faixas avulsas (se houver) agrupando por cargo + vigencia.
DO $migrate_salary_bands$
DECLARE
    band_rec record;
    table_id uuid;
    next_code integer;
BEGIN
    IF to_regclass('public.job_position_salary_band') IS NULL THEN
        RETURN;
    END IF;

    FOR band_rec IN
        SELECT
            job_position_id,
            company_id,
            valid_from,
            valid_until,
            MAX(version_number) AS version_number
        FROM job_position_salary_band
        WHERE status <> 'DELETED'
          AND level IS NOT NULL
        GROUP BY job_position_id, company_id, valid_from, valid_until
        ORDER BY job_position_id, valid_from
    LOOP
        SELECT COALESCE(MAX(code), 0) + 1 INTO next_code FROM job_position_salary_table;

        table_id := gen_random_uuid();
        INSERT INTO job_position_salary_table (
            id, code, status, company_id, job_position_id, name,
            version_number, valid_from, valid_until, created_at
        ) VALUES (
            table_id,
            next_code,
            'ACTIVE',
            band_rec.company_id,
            band_rec.job_position_id,
            NULL,
            COALESCE(band_rec.version_number, 1),
            band_rec.valid_from,
            band_rec.valid_until,
            now()
        );

        INSERT INTO job_position_salary_table_item (
            id, salary_table_id, level, min_salary, reference_salary, max_salary
        )
        SELECT
            gen_random_uuid(),
            table_id,
            b.level,
            b.min_salary,
            b.reference_salary,
            b.max_salary
        FROM job_position_salary_band b
        WHERE b.status <> 'DELETED'
          AND b.job_position_id = band_rec.job_position_id
          AND b.valid_from = band_rec.valid_from
          AND b.level IS NOT NULL
          AND (
              (b.valid_until IS NULL AND band_rec.valid_until IS NULL)
              OR b.valid_until IS NOT DISTINCT FROM band_rec.valid_until
          )
          AND (b.company_id IS NOT DISTINCT FROM band_rec.company_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END
$migrate_salary_bands$;

DROP TABLE IF EXISTS job_position_salary_band CASCADE;

DO $sync_job_position_salary_table$
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
        IF to_regclass(format('%I.job_position_salary_table', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_position_salary_table (LIKE public.job_position_salary_table INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.job_position_salary_table_item', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_position_salary_table_item (LIKE public.job_position_salary_table_item INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.job_position_salary_band', target_schema)) IS NOT NULL THEN
            EXECUTE format('DROP TABLE IF EXISTS %I.job_position_salary_band CASCADE', target_schema);
        END IF;
    END LOOP;
END
$sync_job_position_salary_table$;
