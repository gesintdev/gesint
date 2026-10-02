-- Integracao V122 (audit) x V123 (jobrequisition): ambas usam o id 56000000-...-0001 para a
-- permissao de leitura. Em banco novo a V122 roda antes e a V123 descarta jobrequisition:read
-- (ON CONFLICT (id) DO NOTHING). Aqui garantimos a authority por nome, sem depender do id.

INSERT INTO permission (id, code, module, authority, description)
SELECT '56100000-0000-0000-0000-000000000001', 10067, 'jobrequisition', 'jobrequisition:read', 'Visualizar requisições de vaga'
WHERE NOT EXISTS (SELECT 1 FROM permission p WHERE p.authority = 'jobrequisition:read')
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE authority = 'jobrequisition:read'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT DISTINCT rp.role_id, target.id
FROM role_permission rp
INNER JOIN permission source ON source.id = rp.permission_id
    AND source.authority = 'jobvacancy:write'
CROSS JOIN permission target
WHERE target.authority = 'jobrequisition:read'
ON CONFLICT DO NOTHING;

SELECT public.gommo_sync_admin_profile_permissions();

DO $fix_job_requisition_read$
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
        EXECUTE format(
            $sql$
            INSERT INTO %I.permission (id, code, authority, module, description)
            SELECT p.id, p.code, p.authority, p.module, p.description
            FROM public.permission p
            WHERE p.authority = 'jobrequisition:read'
              AND NOT EXISTS (SELECT 1 FROM %I.permission t WHERE t.authority = 'jobrequisition:read')
            ON CONFLICT DO NOTHING
            $sql$,
            target_schema,
            target_schema
        );

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.authority = 'jobrequisition:read'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );

            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT DISTINCT rp.role_id, target.id
                FROM %I.role_permission rp
                INNER JOIN %I.permission source ON source.id = rp.permission_id
                    AND source.authority = 'jobvacancy:write'
                CROSS JOIN %I.permission target
                WHERE target.authority = 'jobrequisition:read'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$fix_job_requisition_read$;
