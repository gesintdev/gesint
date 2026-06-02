-- RG issuing body and state (Brazilian identity document)

ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS rg_issuer VARCHAR(20),
    ADD COLUMN IF NOT EXISTS rg_state_code VARCHAR(2);

ALTER TABLE collaborator
    ADD COLUMN IF NOT EXISTS rg_issuer VARCHAR(20),
    ADD COLUMN IF NOT EXISTS rg_state_code VARCHAR(2);
