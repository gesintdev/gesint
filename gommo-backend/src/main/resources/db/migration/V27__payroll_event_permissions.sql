-- Permissoes: eventos de folha

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('40000000-0000-0000-0000-000000000001', 9001, 'payrollevent', 'payrollevent:read', 'Listar eventos de folha'),
    ('40000000-0000-0000-0000-000000000002', 9002, 'payrollevent', 'payrollevent:write', 'Criar e editar eventos de folha'),
    ('40000000-0000-0000-0000-000000000003', 9003, 'payrollevent', 'payrollevent:delete', 'Excluir eventos de folha')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'payrollevent'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module = 'payrollevent' AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;
