CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- unaccent e STABLE por padrao; indices exigem IMMUTABLE.
CREATE OR REPLACE FUNCTION immutable_unaccent(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT public.unaccent('public.unaccent', value)
$$;

CREATE TABLE IF NOT EXISTS search_document (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    document_type   VARCHAR(40) NOT NULL,
    entity_id       UUID NOT NULL,
    title           VARCHAR(255) NOT NULL,
    subtitle        VARCHAR(255),
    search_text     TEXT NOT NULL,
    href            VARCHAR(255) NOT NULL,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_search_document_type_entity_active
    ON search_document (document_type, entity_id)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_search_document_trgm
    ON search_document
    USING gin (lower(immutable_unaccent(search_text)) gin_trgm_ops);

-- Espelha a tabela nos schemas tenant_* existentes.
DO $sync_search_document$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.search_document', target_schema)) IS NULL
           AND to_regclass('public.search_document') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.search_document (LIKE public.search_document INCLUDING ALL)',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_search_document$;
