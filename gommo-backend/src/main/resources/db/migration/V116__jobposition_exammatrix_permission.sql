-- Matriz de exames no cadastro de Cargo: authority sob jobposition (aba do CRUD).
-- Quem ja tinha jobposition:write ou occupationalexam:read recebe a nova permissao.

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('55000000-0000-0000-0000-000000000001', 10051, 'jobposition', 'jobposition:exammatrix', 'Matriz de exames do cargo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO permission (id, code, module, authority, description)
SELECT gen_random_uuid(), 10051, 'jobposition', 'jobposition:exammatrix', 'Matriz de exames do cargo'
WHERE NOT EXISTS (
    SELECT 1 FROM permission p WHERE p.authority = 'jobposition:exammatrix'
);

-- Perfis que editam cargo ou ja geriam exames passam a ver a aba.
INSERT INTO role_permission (role_id, permission_id)
SELECT DISTINCT rp.role_id, target.id
FROM role_permission rp
INNER JOIN permission source ON source.id = rp.permission_id
    AND source.authority IN ('jobposition:write', 'occupationalexam:read')
CROSS JOIN permission target
WHERE target.authority = 'jobposition:exammatrix'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE authority = 'jobposition:exammatrix'
ON CONFLICT DO NOTHING;

SELECT public.gommo_sync_admin_profile_permissions();

DO $sync_jobposition_exammatrix$
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
            WHERE p.authority = 'jobposition:exammatrix'
            ON CONFLICT (id) DO NOTHING
            $sql$,
            target_schema
        );

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT DISTINCT rp.role_id, target.id
                FROM %I.role_permission rp
                INNER JOIN %I.permission source ON source.id = rp.permission_id
                    AND source.authority IN ('jobposition:write', 'occupationalexam:read')
                CROSS JOIN %I.permission target
                WHERE target.authority = 'jobposition:exammatrix'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema,
                target_schema,
                target_schema
            );

            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.authority = 'jobposition:exammatrix'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_jobposition_exammatrix$;
