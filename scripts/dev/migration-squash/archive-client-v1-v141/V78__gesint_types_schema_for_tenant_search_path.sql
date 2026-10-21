-- Schema somente de tipos compartilhados (enums via DOMAIN).
-- Entra no search_path do tenant comercial para CAST(? AS status_enum) do Hibernate,
-- sem expor tabelas de public (fail-closed: nao criar TABELAS neste schema).

CREATE SCHEMA IF NOT EXISTS gesint_types;

DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typtype = 'e'
        ORDER BY t.typname
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_type t2
            JOIN pg_namespace n2 ON n2.oid = t2.typnamespace
            WHERE n2.nspname = 'gesint_types'
              AND t2.typname = r.typname
        ) THEN
            EXECUTE format(
                'CREATE DOMAIN gesint_types.%I AS public.%I',
                r.typname,
                r.typname
            );
        END IF;
    END LOOP;
END $$;

COMMENT ON SCHEMA gesint_types IS
    'Tipos/domains compartilhados para search_path multi-tenant. Nunca criar tabelas aqui.';
