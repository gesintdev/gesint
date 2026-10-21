ALTER TABLE admin.client
    ADD COLUMN routing_mode VARCHAR(32) NOT NULL DEFAULT 'SUBDOMAIN',
    ADD COLUMN subdomain VARCHAR(100),
    ADD COLUMN custom_domain VARCHAR(200),
    ADD COLUMN database_strategy VARCHAR(32) NOT NULL DEFAULT 'DEDICATED_DATABASE',
    ADD COLUMN database_host VARCHAR(200),
    ADD COLUMN database_port INTEGER,
    ADD COLUMN database_name VARCHAR(100),
    ADD COLUMN database_schema VARCHAR(100),
    ADD COLUMN database_user VARCHAR(150),
    ADD COLUMN database_secret_ref VARCHAR(255),
    ADD COLUMN provisioning_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN provisioning_notes TEXT;

CREATE INDEX idx_client_subdomain ON admin.client (subdomain) WHERE status != 'DELETED';
CREATE INDEX idx_client_custom_domain ON admin.client (custom_domain) WHERE status != 'DELETED';
