-- Log de erros do assistente de I.A. no Client (sem payload de mensagem do usuário).

CREATE TABLE IF NOT EXISTS admin.assistant_error_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID,
    client_name     VARCHAR(200),
    user_id         UUID,
    user_name       VARCHAR(200),
    user_email      VARCHAR(200),
    tenant_schema   VARCHAR(100),
    summary         VARCHAR(500) NOT NULL,
    error_class     VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_error_log_created_at
    ON admin.assistant_error_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assistant_error_log_client_id
    ON admin.assistant_error_log (client_id);

COMMENT ON TABLE admin.assistant_error_log IS 'Falhas do assistente I.A. (Client); sem conteúdo sensível da conversa';
