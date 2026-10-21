INSERT INTO role (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'ADMIN', 'Administrador do sistema'),
    ('00000000-0000-0000-0000-000000000002', 'HR', 'Recursos Humanos');

INSERT INTO permission (id, code, module, description) VALUES
    ('10000000-0000-0000-0000-000000000001', 'person:read', 'person', 'Listar pessoas'),
    ('10000000-0000-0000-0000-000000000002', 'person:write', 'person', 'Criar e editar pessoas'),
    ('10000000-0000-0000-0000-000000000003', 'person:delete', 'person', 'Excluir pessoas (soft)');

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE code IN ('person:read', 'person:write');
