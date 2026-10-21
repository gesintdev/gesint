-- Service provider (PJ) fields on admission_process

ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS provider_cnpj VARCHAR(14),
    ADD COLUMN IF NOT EXISTS provider_legal_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS provider_trade_name VARCHAR(200);
