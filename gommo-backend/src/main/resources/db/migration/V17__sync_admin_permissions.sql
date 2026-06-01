-- Garante que ADMIN possui todas as permissões (incl. role:* e user:* após deploys incrementais)

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM permission p
ON CONFLICT DO NOTHING;
