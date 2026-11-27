-- Gestao de Ponto (GP) vira sistema proprio no rail.
-- ADD VALUE fica sozinho nesta migration: o PostgreSQL nao deixa usar o valor novo
-- na mesma transacao em que ele foi criado (os seeds estao na V12).
ALTER TYPE gesint_types.system_scope_enum ADD VALUE IF NOT EXISTS 'PONTO';
