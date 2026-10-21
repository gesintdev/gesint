-- Experiencias profissionais do candidato (preenchimento manual na candidatura).

CREATE TABLE IF NOT EXISTS candidate_experience (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    candidate_id    UUID NOT NULL REFERENCES candidate (id),
    company_name    VARCHAR(200) NOT NULL,
    job_title       VARCHAR(200) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,
    current_job     BOOLEAN NOT NULL DEFAULT false,
    description     TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_candidate_experience_candidate
    ON candidate_experience (candidate_id)
    WHERE status <> 'DELETED';

DO $sync_candidate_experience$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.candidate', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.candidate_experience', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.candidate_experience (LIKE public.candidate_experience INCLUDING ALL)',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_candidate_experience$;
