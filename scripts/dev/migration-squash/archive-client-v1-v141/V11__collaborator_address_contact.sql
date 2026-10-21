-- Endereço e contato do colaborador (criados no fluxo de admissão)

CREATE TABLE collaborator_address (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id UUID NOT NULL REFERENCES collaborator(id),
    zip_code        VARCHAR(10),
    street          VARCHAR(200),
    number          VARCHAR(20),
    complement      VARCHAR(100),
    district        VARCHAR(100),
    city            VARCHAR(100),
    state_code      VARCHAR(2),
    is_primary      BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX idx_collaborator_address_collaborator
    ON collaborator_address (collaborator_id)
    WHERE status != 'DELETED';

CREATE TABLE collaborator_contact (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id UUID NOT NULL REFERENCES collaborator(id),
    email           VARCHAR(200),
    phone           VARCHAR(20),
    is_primary      BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX idx_collaborator_contact_collaborator
    ON collaborator_contact (collaborator_id)
    WHERE status != 'DELETED';
