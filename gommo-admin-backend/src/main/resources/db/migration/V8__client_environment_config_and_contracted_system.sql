-- Configuracao de ambiente do tenant (1:1 com client) e sistemas contratados (1:N)

CREATE TABLE admin.client_environment_config (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status                  public.status_enum NOT NULL DEFAULT 'ACTIVE',
    code                    INTEGER,
    client_id               UUID NOT NULL REFERENCES admin.client(id),
    routing_mode            VARCHAR(32) NOT NULL DEFAULT 'SUBDOMAIN',
    subdomain               VARCHAR(100),
    custom_domain           VARCHAR(200),
    database_strategy       VARCHAR(32) NOT NULL DEFAULT 'DEDICATED_DATABASE',
    database_host           VARCHAR(200),
    database_port           INTEGER,
    database_name           VARCHAR(100),
    database_schema         VARCHAR(100),
    database_user           VARCHAR(150),
    database_secret_ref     VARCHAR(255),
    provisioning_status     VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    provisioning_notes      TEXT,
    created_by              UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by              UUID,
    updated_at              TIMESTAMPTZ
);

-- Migra dados existentes de admin.client para a nova tabela de configuracao
INSERT INTO admin.client_environment_config (
    client_id, status, routing_mode, subdomain, custom_domain, database_strategy,
    database_host, database_port, database_name, database_schema, database_user,
    database_secret_ref, provisioning_status, provisioning_notes, created_at
)
SELECT
    id, status, routing_mode, subdomain, custom_domain, database_strategy,
    database_host, database_port, database_name, database_schema, database_user,
    database_secret_ref, provisioning_status, provisioning_notes, now()
FROM admin.client;

UPDATE admin.client_environment_config t
SET code = s.rn
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY client_id) AS rn FROM admin.client_environment_config
) s
WHERE t.id = s.id;

ALTER TABLE admin.client_environment_config ALTER COLUMN code SET NOT NULL;

CREATE UNIQUE INDEX uk_client_environment_config_code ON admin.client_environment_config (code);
CREATE UNIQUE INDEX idx_client_environment_config_client
    ON admin.client_environment_config (client_id)
    WHERE status != 'DELETED';
CREATE INDEX idx_client_environment_config_subdomain
    ON admin.client_environment_config (subdomain)
    WHERE status != 'DELETED';
CREATE INDEX idx_client_environment_config_custom_domain
    ON admin.client_environment_config (custom_domain)
    WHERE status != 'DELETED';

-- Remove os campos migrados de admin.client (agora vivem em client_environment_config)
DROP INDEX IF EXISTS admin.idx_client_subdomain;
DROP INDEX IF EXISTS admin.idx_client_custom_domain;

ALTER TABLE admin.client
    DROP COLUMN routing_mode,
    DROP COLUMN subdomain,
    DROP COLUMN custom_domain,
    DROP COLUMN database_strategy,
    DROP COLUMN database_host,
    DROP COLUMN database_port,
    DROP COLUMN database_name,
    DROP COLUMN database_schema,
    DROP COLUMN database_user,
    DROP COLUMN database_secret_ref,
    DROP COLUMN provisioning_status,
    DROP COLUMN provisioning_notes;

-- Sistemas contratados por cliente (1:N)
CREATE TABLE admin.client_contracted_system (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              public.status_enum NOT NULL DEFAULT 'ACTIVE',
    code                INTEGER NOT NULL,
    client_id           UUID NOT NULL REFERENCES admin.client(id),
    name                VARCHAR(150) NOT NULL,
    module_name         VARCHAR(150),
    operational_status  VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    status_date         DATE,
    return_date         DATE,
    negotiated_amount   NUMERIC(12, 2),
    discount_percent    NUMERIC(5, 2),
    agreed_amount       NUMERIC(12, 2),
    contract_type       VARCHAR(32),
    contract_date       DATE,
    end_date            DATE,
    due_day             VARCHAR(2),
    late_tolerance      VARCHAR(50),
    with_ai             BOOLEAN NOT NULL DEFAULT false,
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uk_client_contracted_system_code ON admin.client_contracted_system (code);
CREATE INDEX idx_client_contracted_system_client ON admin.client_contracted_system (client_id);
