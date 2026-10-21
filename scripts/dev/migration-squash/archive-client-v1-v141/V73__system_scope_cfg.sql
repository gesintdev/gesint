-- Inclui CFG no escopo de sistema dos perfis de acesso
ALTER TYPE system_scope_enum ADD VALUE IF NOT EXISTS 'CFG';
