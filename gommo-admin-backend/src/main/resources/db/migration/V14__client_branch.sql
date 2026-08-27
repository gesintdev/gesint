-- Filiais do cliente no control plane.
--
-- A filial vive de fato no schema do tenant, como uma linha de "company". Esta tabela e o cadastro
-- do admin: ela permite montar a estrutura da empresa antes do schema existir e serve de fonte para
-- o seed de "company" no provisionamento, ja que o schema do tenant nasce com "company" vazia.

CREATE TABLE IF NOT EXISTS admin.client_branch (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status                  gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    code                    INTEGER,
    client_id               UUID NOT NULL REFERENCES admin.client(id),
    tenant_company_id       UUID,
    is_headquarters         BOOLEAN NOT NULL DEFAULT false,
    sort_order              INTEGER NOT NULL DEFAULT 0,
    legal_name              VARCHAR(255) NOT NULL,
    trade_name              VARCHAR(255),
    cnpj                    VARCHAR(18) NOT NULL,
    state_registration      VARCHAR(32),
    municipal_registration  VARCHAR(32),
    email                   VARCHAR(200),
    phone                   VARCHAR(20),
    street                  VARCHAR(200),
    number                  VARCHAR(20),
    complement              VARCHAR(100),
    district                VARCHAR(100),
    city                    VARCHAR(100),
    state_code              VARCHAR(2),
    zip_code                VARCHAR(10),
    provisioned_at          TIMESTAMPTZ,
    created_by              UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by              UUID,
    updated_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_branch_client ON admin.client_branch (client_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_client_branch_code ON admin.client_branch (code);

-- CNPJ identifica o estabelecimento: e por ele que o seed reconhece a filial ja provisionada.
CREATE UNIQUE INDEX IF NOT EXISTS uk_client_branch_client_cnpj
    ON admin.client_branch (client_id, cnpj)
    WHERE status != 'DELETED';

-- Exatamente uma matriz por cliente.
CREATE UNIQUE INDEX IF NOT EXISTS uk_client_branch_headquarters
    ON admin.client_branch (client_id)
    WHERE is_headquarters AND status != 'DELETED';
