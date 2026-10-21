-- Garante que o usuário admin tenha a role ADMIN (todas as permissões, incluindo person:write)
INSERT INTO user_role (user_id, role_id)
SELECT u.id, '00000000-0000-0000-0000-000000000001'::uuid
FROM app_user u
WHERE u.username = 'admin'
  AND u.status = 'ACTIVE'
ON CONFLICT DO NOTHING;
