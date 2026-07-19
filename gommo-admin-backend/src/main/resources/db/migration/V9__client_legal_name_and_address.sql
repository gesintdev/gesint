-- Dados cadastrais comerciais do cliente (razao social, endereco, telefones ampliados).

ALTER TABLE admin.client
    ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE admin.client
    ALTER COLUMN contact_phone TYPE VARCHAR(120);

COMMENT ON COLUMN admin.client.name IS 'Nome fantasia';
COMMENT ON COLUMN admin.client.legal_name IS 'Razao social';
COMMENT ON COLUMN admin.client.address IS 'Endereco completo';
COMMENT ON COLUMN admin.client.contact_phone IS 'Telefone(s) de contato';
