-- V114 usou UUIDs 52000000-... ja ocupados por actingprofile (ON CONFLICT DO NOTHING
-- nao inseriu documenttype:*). Corrige o catalogo de permissoes e propaga aos tenants.

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('54000000-0000-0000-0000-000000000001', 9971, 'documenttype', 'documenttype:read', 'Visualizar tipos de documento'),
    ('54000000-0000-0000-0000-000000000002', 9972, 'documenttype', 'documenttype:write', 'Cadastrar e editar tipos de documento'),
    ('54000000-0000-0000-0000-000000000003', 9973, 'documenttype', 'documenttype:delete', 'Excluir tipos de documento')
ON CONFLICT (id) DO NOTHING;

-- Garante authority unica mesmo se o id ja existir sob outro module (nao esperado).
INSERT INTO permission (id, code, module, authority, description)
SELECT gen_random_uuid(), v.code, 'documenttype', v.authority, v.description
FROM (VALUES
    (9971, 'documenttype:read', 'Visualizar tipos de documento'),
    (9972, 'documenttype:write', 'Cadastrar e editar tipos de documento'),
    (9973, 'documenttype:delete', 'Excluir tipos de documento')
) AS v(code, authority, description)
WHERE NOT EXISTS (
    SELECT 1 FROM permission p WHERE p.authority = v.authority
);

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'documenttype'
ON CONFLICT DO NOTHING;

SELECT public.gommo_sync_admin_profile_permissions();

DO $sync_documenttype_permissions$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.document_type', target_schema)) IS NULL
           AND to_regclass('public.document_type') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.document_type (LIKE public.document_type INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.document_type', target_schema)) IS NOT NULL
           AND to_regclass('public.document_type') IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.document_type (
                    id, code, status, type_code, name, description, data_class,
                    contexts, system_managed, sort_order, created_at
                )
                SELECT
                    p.id, p.code, p.status, p.type_code, p.name, p.description, p.data_class,
                    p.contexts, p.system_managed, p.sort_order, now()
                FROM public.document_type p
                WHERE p.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1 FROM %I.document_type t
                      WHERE LOWER(t.type_code) = LOWER(p.type_code) AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;

        EXECUTE format(
            $sql$
            INSERT INTO %I.permission (id, code, authority, module, description)
            SELECT p.id, p.code, p.authority, p.module, p.description
            FROM public.permission p
            WHERE p.module = 'documenttype'
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
                WHERE p.module = 'documenttype'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_documenttype_permissions$;
