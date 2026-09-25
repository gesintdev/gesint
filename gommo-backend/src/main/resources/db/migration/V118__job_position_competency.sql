-- RN-11: competencias exigidas do cargo, com nivel esperado (1-4) e vigencia.

CREATE TYPE gommo_types.job_position_competency_expected_level_enum AS ENUM (
    'LEVEL_1',
    'LEVEL_2',
    'LEVEL_3',
    'LEVEL_4'
);

CREATE TYPE gommo_types.job_position_competency_usage_enum AS ENUM (
    'SELECTION',
    'EXPERIENCE',
    'PERFORMANCE',
    'INTERVIEW',
    'TECHNICAL_TEST',
    'PDI'
);

CREATE TABLE IF NOT EXISTS job_position_competency (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                INTEGER NOT NULL,
    status              gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id          UUID,
    job_position_id     UUID NOT NULL REFERENCES job_position (id),
    competency_id       UUID NOT NULL REFERENCES competency (id),
    expected_level      gommo_types.job_position_competency_expected_level_enum NOT NULL,
    used_in             JSONB NOT NULL DEFAULT '[]'::jsonb,
    version_number      INT NOT NULL DEFAULT 1,
    valid_from          DATE NOT NULL,
    valid_until         DATE,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_position_competency_code
    ON job_position_competency (code);

CREATE INDEX IF NOT EXISTS idx_job_position_competency_position
    ON job_position_competency (job_position_id, competency_id, valid_from)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_position_competency_company
    ON job_position_competency (company_id)
    WHERE status <> 'DELETED';

DO $sync_job_position_competency$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.job_position', n.nspname)) IS NOT NULL
          AND to_regclass(format('%I.competency', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.job_position_competency', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_position_competency (LIKE public.job_position_competency INCLUDING ALL)',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_job_position_competency$;
