-- Espelha acting_profile + actingprofile:* em TODOS os schemas de cliente
-- (nao so tenant_*%). Schemas de slug livre (ex.: posto_sjb) ficaram de fora na V106.

DO $sync_acting_profile_all$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.acting_profile', target_schema)) IS NULL
           AND to_regclass('public.acting_profile') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.acting_profile (LIKE public.acting_profile INCLUDING ALL)',
                target_schema
            );
        END IF;

        EXECUTE format(
            $sql$
            INSERT INTO %I.permission (id, code, authority, module, description)
            SELECT p.id, p.code, p.authority, p.module, p.description
            FROM public.permission p
            WHERE p.module = 'actingprofile'
            ON CONFLICT (id) DO NOTHING
            $sql$,
            target_schema
        );

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.module = 'actingprofile'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_acting_profile_all$;
