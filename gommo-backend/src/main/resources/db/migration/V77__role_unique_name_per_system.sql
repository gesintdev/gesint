-- Perfis passam a ter nome único por sistema (não mais globalmente).

ALTER TABLE role DROP CONSTRAINT IF EXISTS role_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS uk_role_name_system_active
    ON role (lower(name), system)
    WHERE status <> 'DELETED';
