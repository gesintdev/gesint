-- Domains em gesint_types nao sao comparaveis com o enum real (public.status_enum = status_enum falha).
-- Move os ENUM reais para gesint_types (mesmo OID; colunas existentes continuam validas).
-- search_path do tenant: "tenant", gesint_types  → tabelas so no tenant; tipos em gesint_types.
-- search_path platform/localhost: public, gesint_types

CREATE SCHEMA IF NOT EXISTS gesint_types;

DO $$
DECLARE
    r record;
BEGIN
    -- Remove domains criados na V78
    FOR r IN
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'gesint_types'
          AND t.typtype = 'd'
        ORDER BY t.typname
    LOOP
        EXECUTE format('DROP DOMAIN gesint_types.%I CASCADE', r.typname);
    END LOOP;

    -- Move enums de public → gesint_types
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
              AND t2.typtype = 'e'
        ) THEN
            EXECUTE format('ALTER TYPE public.%I SET SCHEMA gesint_types', r.typname);
        END IF;
    END LOOP;
END $$;

COMMENT ON SCHEMA gesint_types IS
    'Enums compartilhados (sem tabelas). Usado no search_path multi-tenant para casts Hibernate fail-closed.';
