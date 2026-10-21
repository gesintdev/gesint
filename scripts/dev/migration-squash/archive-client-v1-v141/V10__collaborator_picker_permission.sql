-- Permite listar colaboradores admitidos em módulos que referenciam colaborador (ex.: férias)

INSERT INTO permission (id, code, module, description) VALUES
    ('20000000-0000-0000-0000-000000000063', 'collaborator:picker', 'collaborator', 'Listar colaboradores admitidos para seleção');

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE code = 'collaborator:picker';

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE code = 'collaborator:picker';
