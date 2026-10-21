-- Backfill do catalogo eSocial Tabela 27 em schemas de tenant que ficaram sem seed
-- (tabela criada vazia no provisionamento; V80 so sincronizou tenants existentes na epoca).

DO $sync_esocial_table27$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.esocial_table27_procedure', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;
        IF to_regclass('public.esocial_table27_procedure') IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format(
            $sql$
            INSERT INTO %I.esocial_table27_procedure (
                id, code, status, procedure_code, description, active, created_at
            )
            SELECT p.id, p.code, p.status, p.procedure_code, p.description, p.active, now()
            FROM public.esocial_table27_procedure p
            WHERE p.status <> 'DELETED'
            ON CONFLICT (id) DO NOTHING
            $sql$,
            target_schema
        );
    END LOOP;
END
$sync_esocial_table27$;
