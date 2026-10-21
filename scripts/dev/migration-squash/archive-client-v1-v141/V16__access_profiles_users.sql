-- Perfis (roles) por sistema + permissões de gestão de acesso

CREATE TYPE system_scope_enum AS ENUM ('DP', 'RH');

ALTER TABLE role ADD COLUMN IF NOT EXISTS system system_scope_enum NOT NULL DEFAULT 'RH';
ALTER TABLE role ADD COLUMN IF NOT EXISTS status status_enum NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE role ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE role ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE role ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE role SET is_system = true WHERE name IN ('ADMIN', 'HR');

INSERT INTO permission (id, code, authority, module, description)
SELECT '21000000-0000-0000-0000-000000000001', (SELECT COALESCE(MAX(code), 0) + 1 FROM permission), 'role:read', 'role', 'Listar perfis de acesso'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE authority = 'role:read');

INSERT INTO permission (id, code, authority, module, description)
SELECT '21000000-0000-0000-0000-000000000002', (SELECT COALESCE(MAX(code), 0) + 1 FROM permission), 'role:write', 'role', 'Criar e editar perfis'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE authority = 'role:write');

INSERT INTO permission (id, code, authority, module, description)
SELECT '21000000-0000-0000-0000-000000000003', (SELECT COALESCE(MAX(code), 0) + 1 FROM permission), 'role:delete', 'role', 'Excluir perfis'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE authority = 'role:delete');

INSERT INTO permission (id, code, authority, module, description)
SELECT '21000000-0000-0000-0000-000000000011', (SELECT COALESCE(MAX(code), 0) + 1 FROM permission), 'user:read', 'user', 'Listar usuários do sistema'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE authority = 'user:read');

INSERT INTO permission (id, code, authority, module, description)
SELECT '21000000-0000-0000-0000-000000000012', (SELECT COALESCE(MAX(code), 0) + 1 FROM permission), 'user:write', 'user', 'Criar e editar usuários'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE authority = 'user:write');

INSERT INTO permission (id, code, authority, module, description)
SELECT '21000000-0000-0000-0000-000000000013', (SELECT COALESCE(MAX(code), 0) + 1 FROM permission), 'user:delete', 'user', 'Excluir usuários'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE authority = 'user:delete');

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE authority LIKE 'role:%' OR authority LIKE 'user:%'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE (authority LIKE 'role:%' OR authority LIKE 'user:%') AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_role_system_status ON role (system, status);
