-- Ciclo de vida do sistema contratado + outbox de eventos para o HR.

ALTER TABLE admin.client_contracted_system
    ADD COLUMN IF NOT EXISTS effective_from TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deactivate_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS session_policy VARCHAR(32) NOT NULL DEFAULT 'KEEP_UNTIL_EXPIRY';

COMMENT ON COLUMN admin.client_contracted_system.effective_from IS 'Inicio da vigencia (null = imediato)';
COMMENT ON COLUMN admin.client_contracted_system.deactivate_at IS 'Fim da vigencia / desativacao agendada';
COMMENT ON COLUMN admin.client_contracted_system.session_policy IS 'FORCE_LOGOUT | KEEP_UNTIL_EXPIRY | SCHEDULED';

CREATE TABLE IF NOT EXISTS admin.platform_outbox_event (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(80) NOT NULL,
    aggregate_type  VARCHAR(80) NOT NULL,
    aggregate_id    UUID NOT NULL,
    payload         JSONB NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    attempts        INTEGER NOT NULL DEFAULT 0,
    last_error      TEXT,
    available_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_outbox_pending
    ON admin.platform_outbox_event (status, available_at)
    WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_platform_outbox_aggregate
    ON admin.platform_outbox_event (aggregate_type, aggregate_id);
