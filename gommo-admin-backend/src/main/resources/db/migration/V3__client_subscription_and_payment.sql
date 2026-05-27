-- Assinatura e cobrança por cliente (control plane)

CREATE TABLE admin.client_subscription (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          public.status_enum NOT NULL DEFAULT 'ACTIVE',
    client_id       UUID NOT NULL REFERENCES admin.client(id),
    plan_code       VARCHAR(50) NOT NULL,
    billing_status  VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    started_at      TIMESTAMPTZ,
    ends_at         TIMESTAMPTZ,
    monthly_amount  NUMERIC(12, 2),
    notes           TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX idx_client_subscription_client ON admin.client_subscription (client_id);
CREATE UNIQUE INDEX idx_client_subscription_client_active
    ON admin.client_subscription (client_id)
    WHERE status != 'DELETED' AND billing_status = 'ACTIVE';

CREATE TABLE admin.client_payment (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          public.status_enum NOT NULL DEFAULT 'ACTIVE',
    client_id       UUID NOT NULL REFERENCES admin.client(id),
    reference_code  VARCHAR(100),
    amount          NUMERIC(12, 2) NOT NULL,
    due_date        DATE NOT NULL,
    paid_at         TIMESTAMPTZ,
    payment_status  VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    notes           TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX idx_client_payment_client ON admin.client_payment (client_id);
CREATE INDEX idx_client_payment_due_date ON admin.client_payment (due_date);
