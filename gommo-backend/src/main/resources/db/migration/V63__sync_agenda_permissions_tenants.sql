-- Sincroniza agenda_event + permissoes agenda:* nos schemas tenant_* existentes.
-- Flyway aplica em public (V62); tenants isolados precisam do catalogo RBAC espelhado.

DO $sync_agenda$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.agenda_event', target_schema)) IS NULL
           AND to_regclass('public.agenda_event') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.agenda_event (LIKE public.agenda_event INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.permission (id, code, authority, module, description)
                SELECT p.id, p.code, p.authority, p.module, p.description
                FROM public.permission p
                WHERE p.module = 'agenda'
                ON CONFLICT (id) DO NOTHING
                $sql$,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT rp.role_id, rp.permission_id
                FROM public.role_permission rp
                INNER JOIN public.permission p ON p.id = rp.permission_id
                WHERE p.module = 'agenda'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema
            );

            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_agenda$;
