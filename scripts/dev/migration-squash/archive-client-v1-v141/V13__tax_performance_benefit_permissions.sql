-- Permissões: fiscal, desempenho e vínculo de benefícios

INSERT INTO permission (id, code, module, description) VALUES
    ('30000000-0000-0000-0000-000000000010', 'tax:read', 'tax', 'Listar obrigações fiscais'),
    ('30000000-0000-0000-0000-000000000011', 'tax:write', 'tax', 'Criar e editar obrigações fiscais'),
    ('30000000-0000-0000-0000-000000000012', 'tax:delete', 'tax', 'Excluir obrigações fiscais'),
    ('30000000-0000-0000-0000-000000000020', 'performance:read', 'performance', 'Listar avaliações de desempenho'),
    ('30000000-0000-0000-0000-000000000021', 'performance:write', 'performance', 'Criar e editar avaliações'),
    ('30000000-0000-0000-0000-000000000022', 'performance:delete', 'performance', 'Excluir avaliações'),
    ('30000000-0000-0000-0000-000000000030', 'benefitenrollment:read', 'benefitenrollment', 'Listar vínculos de benefício'),
    ('30000000-0000-0000-0000-000000000031', 'benefitenrollment:write', 'benefitenrollment', 'Criar e editar vínculos'),
    ('30000000-0000-0000-0000-000000000032', 'benefitenrollment:delete', 'benefitenrollment', 'Excluir vínculos');

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE id::text LIKE '30000000-%';

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE id::text LIKE '30000000-%' AND code NOT LIKE '%:delete';
