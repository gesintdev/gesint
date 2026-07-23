-- Campos de publicação pública da vaga (careers / candidatura).

ALTER TABLE job_vacancy
    ADD COLUMN IF NOT EXISTS slug VARCHAR(120),
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_vacancy_slug_active
    ON job_vacancy (slug)
    WHERE slug IS NOT NULL AND status <> 'DELETED';

-- Espelha nos schemas tenant_* que já possuem job_vacancy.
DO $sync_job_vacancy_public_careers$
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
                'ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS slug VARCHAR(120)',
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false',
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ',
                target_schema
            );
            EXECUTE format(
                'CREATE UNIQUE INDEX IF NOT EXISTS uk_job_vacancy_slug_active ON %I.job_vacancy (slug) WHERE slug IS NOT NULL AND status <> ''DELETED''',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_job_vacancy_public_careers$;
