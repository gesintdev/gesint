-- Quem ja gerencia Perfis (role:read) passa a ter Atuacoes (actingprofile:*),
-- para o menu "Atuações" aparecer no cadastro de perfil e na navegacao CFG.

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('52000000-0000-0000-0000-000000000001', 9961, 'actingprofile', 'actingprofile:read', 'Visualizar perfis de atuacao'),
    ('52000000-0000-0000-0000-000000000002', 9962, 'actingprofile', 'actingprofile:write', 'Cadastrar e editar perfis de atuacao'),
    ('52000000-0000-0000-0000-000000000003', 9963, 'actingprofile', 'actingprofile:delete', 'Excluir perfis de atuacao'),
    ('53000000-0000-0000-0000-00000000000d', 10013, 'actingprofile', 'actingprofile:export', 'Exportar listagem de perfis de atuacao')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT DISTINCT rp.role_id, ap.id
FROM role_permission rp
INNER JOIN permission role_perm
    ON role_perm.id = rp.permission_id
   AND role_perm.authority = 'role:read'
CROSS JOIN permission ap
WHERE ap.module = 'actingprofile'
ON CONFLICT DO NOTHING;

DO $grant_actingprofile$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.role_permission', n.nspname)) IS NOT NULL
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
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

        EXECUTE format(
            $sql$
            INSERT INTO %I.role_permission (role_id, permission_id)
            SELECT DISTINCT rp.role_id, ap.id
            FROM %I.role_permission rp
            INNER JOIN %I.permission role_perm
                ON role_perm.id = rp.permission_id
               AND role_perm.authority = 'role:read'
            CROSS JOIN %I.permission ap
            WHERE ap.module = 'actingprofile'
            ON CONFLICT DO NOTHING
            $sql$,
            target_schema,
            target_schema,
            target_schema,
            target_schema
        );
    END LOOP;
END
$grant_actingprofile$;
