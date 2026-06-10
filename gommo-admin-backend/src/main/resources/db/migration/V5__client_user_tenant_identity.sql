-- Usuarios de cliente: credenciais no control plane; identidade de auth no schema do tenant.

ALTER TABLE admin.client_user DROP CONSTRAINT IF EXISTS client_user_app_user_id_fkey;
DROP INDEX IF EXISTS admin.idx_client_user_app_user;

ALTER TABLE admin.client_user RENAME COLUMN app_user_id TO tenant_app_user_id;
ALTER TABLE admin.client_user ALTER COLUMN tenant_app_user_id DROP NOT NULL;

ALTER TABLE admin.client_user ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE admin.client_user ADD COLUMN IF NOT EXISTS email VARCHAR(200);
ALTER TABLE admin.client_user ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE admin.client_user ADD COLUMN IF NOT EXISTS provisioned_at TIMESTAMPTZ;

UPDATE admin.client_user cu
SET
    username = u.username,
    email = u.email,
    password_hash = u.password_hash,
    provisioned_at = COALESCE(cu.provisioned_at, now())
FROM public.app_user u
WHERE cu.tenant_app_user_id = u.id
  AND cu.username IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_user_client_username
    ON admin.client_user (client_id, LOWER(username))
    WHERE status != 'DELETED' AND username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_user_email
    ON admin.client_user (LOWER(email))
    WHERE status != 'DELETED' AND email IS NOT NULL;
