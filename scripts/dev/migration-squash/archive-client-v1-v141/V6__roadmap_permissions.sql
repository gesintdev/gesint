-- Permissões dos novos módulos (ADMIN recebe tudo; HR leitura/escrita operacional)

INSERT INTO permission (id, code, module, description) VALUES
    ('20000000-0000-0000-0000-000000000001', 'storage:read', 'storage', 'Listar e baixar arquivos'),
    ('20000000-0000-0000-0000-000000000002', 'storage:write', 'storage', 'Enviar e vincular arquivos'),
    ('20000000-0000-0000-0000-000000000003', 'storage:delete', 'storage', 'Excluir arquivos'),
    ('20000000-0000-0000-0000-000000000010', 'company:read', 'company', 'Listar empresas'),
    ('20000000-0000-0000-0000-000000000011', 'company:write', 'company', 'Criar e editar empresas'),
    ('20000000-0000-0000-0000-000000000012', 'company:delete', 'company', 'Excluir empresas'),
    ('20000000-0000-0000-0000-000000000020', 'department:read', 'department', 'Listar departamentos'),
    ('20000000-0000-0000-0000-000000000021', 'department:write', 'department', 'Criar e editar departamentos'),
    ('20000000-0000-0000-0000-000000000022', 'department:delete', 'department', 'Excluir departamentos'),
    ('20000000-0000-0000-0000-000000000030', 'jobposition:read', 'jobposition', 'Listar cargos'),
    ('20000000-0000-0000-0000-000000000031', 'jobposition:write', 'jobposition', 'Criar e editar cargos'),
    ('20000000-0000-0000-0000-000000000032', 'jobposition:delete', 'jobposition', 'Excluir cargos'),
    ('20000000-0000-0000-0000-000000000040', 'contract:read', 'contract', 'Listar contratos'),
    ('20000000-0000-0000-0000-000000000041', 'contract:write', 'contract', 'Criar e editar contratos'),
    ('20000000-0000-0000-0000-000000000042', 'contract:delete', 'contract', 'Excluir contratos'),
    ('20000000-0000-0000-0000-000000000050', 'attendance:read', 'attendance', 'Listar registros de ponto'),
    ('20000000-0000-0000-0000-000000000051', 'attendance:write', 'attendance', 'Criar e editar ponto'),
    ('20000000-0000-0000-0000-000000000052', 'attendance:delete', 'attendance', 'Excluir ponto'),
    ('20000000-0000-0000-0000-000000000060', 'leave:read', 'leave', 'Listar férias e afastamentos'),
    ('20000000-0000-0000-0000-000000000061', 'leave:write', 'leave', 'Criar e editar férias/afastamentos'),
    ('20000000-0000-0000-0000-000000000062', 'leave:delete', 'leave', 'Excluir férias/afastamentos'),
    ('20000000-0000-0000-0000-000000000070', 'payroll:read', 'payroll', 'Listar folhas'),
    ('20000000-0000-0000-0000-000000000071', 'payroll:write', 'payroll', 'Processar folha'),
    ('20000000-0000-0000-0000-000000000072', 'payroll:delete', 'payroll', 'Excluir folha'),
    ('20000000-0000-0000-0000-000000000080', 'payslip:read', 'payslip', 'Listar holerites'),
    ('20000000-0000-0000-0000-000000000081', 'payslip:write', 'payslip', 'Gerar holerites'),
    ('20000000-0000-0000-0000-000000000082', 'payslip:delete', 'payslip', 'Excluir holerites'),
    ('20000000-0000-0000-0000-000000000090', 'benefit:read', 'benefit', 'Listar benefícios'),
    ('20000000-0000-0000-0000-000000000091', 'benefit:write', 'benefit', 'Criar e editar benefícios'),
    ('20000000-0000-0000-0000-000000000092', 'benefit:delete', 'benefit', 'Excluir benefícios'),
    ('20000000-0000-0000-0000-000000000100', 'admission:read', 'admission', 'Listar admissões'),
    ('20000000-0000-0000-0000-000000000101', 'admission:write', 'admission', 'Gerenciar admissões'),
    ('20000000-0000-0000-0000-000000000102', 'admission:delete', 'admission', 'Excluir admissões'),
    ('20000000-0000-0000-0000-000000000110', 'offboarding:read', 'offboarding', 'Listar desligamentos'),
    ('20000000-0000-0000-0000-000000000111', 'offboarding:write', 'offboarding', 'Registrar desligamento'),
    ('20000000-0000-0000-0000-000000000112', 'offboarding:delete', 'offboarding', 'Excluir desligamento'),
    ('20000000-0000-0000-0000-000000000120', 'exitinterview:read', 'exitinterview', 'Listar entrevistas de desligamento'),
    ('20000000-0000-0000-0000-000000000121', 'exitinterview:write', 'exitinterview', 'Registrar entrevista'),
    ('20000000-0000-0000-0000-000000000122', 'exitinterview:delete', 'exitinterview', 'Excluir entrevista');

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE id::text LIKE '20000000-%';

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE id::text LIKE '20000000-%' AND code NOT LIKE '%:delete';
