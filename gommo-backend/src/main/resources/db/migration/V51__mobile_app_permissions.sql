INSERT INTO role (id, code, name, description, system, status, is_system)
SELECT
    '00000000-0000-0000-0000-000000000003',
    COALESCE((SELECT MAX(code) FROM role), 0) + 1,
    'MOBILE',
    'Acesso do aplicativo mobile do colaborador',
    'RH',
    'ACTIVE',
    true
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'MOBILE');

UPDATE role
SET description = 'Acesso do aplicativo mobile do colaborador',
    status = 'ACTIVE',
    is_system = true
WHERE name = 'MOBILE';

INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r
JOIN permission p ON p.authority IN ('attendance:write', 'storage:write')
WHERE r.name = 'MOBILE'
ON CONFLICT DO NOTHING;

INSERT INTO user_role (user_id, role_id)
SELECT u.id, r.id
FROM app_user u
JOIN role r ON r.name = 'MOBILE'
WHERE u.status = 'ACTIVE'
  AND u.collaborator_id IS NOT NULL
ON CONFLICT DO NOTHING;