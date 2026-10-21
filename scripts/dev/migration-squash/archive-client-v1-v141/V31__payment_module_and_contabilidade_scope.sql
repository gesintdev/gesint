-- Contabilidade system scope + modulo Pagamentos (DP)

ALTER TYPE system_scope_enum ADD VALUE IF NOT EXISTS 'CONTABILIDADE';

CREATE TYPE payment_batch_type_enum AS ENUM ('SALARY');

CREATE TYPE payment_batch_status_enum AS ENUM ('PROCESSING', 'PROCESSED', 'PARTIALLY_SENT', 'SENT');

CREATE TYPE payment_slip_status_enum AS ENUM ('PROCESSED', 'DIVERGENT', 'SENT');

CREATE TABLE payment_period (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    reference_date  DATE NOT NULL,
    notes           TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_payment_period_reference_active
    ON payment_period (reference_date)
    WHERE status != 'DELETED';

CREATE TABLE payment_batch (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    payment_period_id   UUID NOT NULL REFERENCES payment_period(id),
    batch_type          payment_batch_type_enum NOT NULL DEFAULT 'SALARY',
    description         VARCHAR(500),
    source_object_id    UUID NOT NULL REFERENCES storage_object(id),
    batch_status        payment_batch_status_enum NOT NULL DEFAULT 'PROCESSING',
    item_count          INTEGER NOT NULL DEFAULT 0,
    divergent_count     INTEGER NOT NULL DEFAULT 0,
    sent_count          INTEGER NOT NULL DEFAULT 0,
    processed_at        TIMESTAMPTZ,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_payment_batch_period
    ON payment_batch (payment_period_id)
    WHERE status != 'DELETED';

CREATE TABLE payment_slip (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    payment_batch_id    UUID NOT NULL REFERENCES payment_batch(id),
    collaborator_id     UUID REFERENCES collaborator(id),
    extracted_name      VARCHAR(200) NOT NULL,
    slip_object_id      UUID REFERENCES storage_object(id),
    slip_status         payment_slip_status_enum NOT NULL DEFAULT 'PROCESSED',
    page_number         INTEGER NOT NULL,
    processed_at        TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ,
    email_sent_at       TIMESTAMPTZ,
    whatsapp_sent_at    TIMESTAMPTZ,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_payment_slip_batch
    ON payment_slip (payment_batch_id)
    WHERE status != 'DELETED';

CREATE INDEX idx_payment_slip_collaborator
    ON payment_slip (collaborator_id)
    WHERE status != 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('41000000-0000-0000-0000-000000000001', 9101, 'payment', 'payment:read', 'Listar pagamentos e periodos'),
    ('41000000-0000-0000-0000-000000000002', 9102, 'payment', 'payment:write', 'Processar arquivos de pagamento'),
    ('41000000-0000-0000-0000-000000000003', 9103, 'payment', 'payment:delete', 'Excluir periodos e lotes de pagamento')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'payment'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module = 'payment' AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;
