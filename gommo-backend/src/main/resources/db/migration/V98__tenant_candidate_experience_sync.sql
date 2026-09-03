-- Tenants provisionados pelo admin nao recebem candidate_experience: a tabela ficou de fora do
-- catalogo de clone. Candidatura publica consulta essa tabela em todo apply e estoura 500.

DO $sync_candidate_experience$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        BEGIN
            IF to_regclass(format('%I.candidate', target_schema)) IS NOT NULL
               AND to_regclass(format('%I.candidate_experience', target_schema)) IS NULL
               AND to_regclass('public.candidate_experience') IS NOT NULL THEN
                EXECUTE format(
                    'CREATE TABLE %I.candidate_experience (LIKE public.candidate_experience INCLUDING ALL)',
                    target_schema
                );
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'candidate_experience skip %: %', target_schema, SQLERRM;
        END;
    END LOOP;
END
$sync_candidate_experience$;
