-- Token de primeiro acesso / redefinicao de senha em admin_user e client_user.

ALTER TABLE admin.admin_user
    ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE admin.admin_user
    ADD COLUMN IF NOT EXISTS access_token_hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS first_access_completed BOOLEAN NOT NULL DEFAULT false;

-- Usuarios existentes com senha ja completaram o primeiro acesso.
UPDATE admin.admin_user
SET first_access_completed = true
WHERE password_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_user_access_token_hash
    ON admin.admin_user (access_token_hash)
    WHERE access_token_hash IS NOT NULL AND status <> 'DELETED';

ALTER TABLE admin.client_user
    ADD COLUMN IF NOT EXISTS access_token_hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS first_access_completed BOOLEAN NOT NULL DEFAULT false;

UPDATE admin.client_user
SET first_access_completed = true
WHERE password_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_client_user_access_token_hash
    ON admin.client_user (access_token_hash)
    WHERE access_token_hash IS NOT NULL AND status <> 'DELETED';
