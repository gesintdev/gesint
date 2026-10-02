-- Configuracao SMTP da Gesint (linha unica). O Client (gommo-backend) le esta tabela para disparar e-mails
-- de todos os tenants. A senha fica cifrada (AES-GCM) com GOMMO_SECRET_ENCRYPTION_KEY / JWT_SECRET,
-- a mesma chave nos dois backends.

CREATE TABLE IF NOT EXISTS admin.platform_email_settings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status                  gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    code                    INTEGER NOT NULL UNIQUE,
    enabled                 BOOLEAN NOT NULL DEFAULT false,
    host                    VARCHAR(200),
    port                    INTEGER,
    security                VARCHAR(16) NOT NULL DEFAULT 'STARTTLS',
    username                VARCHAR(200),
    password_encrypted      BYTEA,
    from_address            VARCHAR(200),
    from_name               VARCHAR(120),
    reply_to                VARCHAR(200),
    last_test_at            TIMESTAMPTZ,
    last_test_success       BOOLEAN,
    last_test_message       VARCHAR(500),
    created_by              UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by              UUID,
    updated_at              TIMESTAMPTZ
);

COMMENT ON TABLE admin.platform_email_settings IS 'SMTP da plataforma Gesint (linha unica, lida pelo Client)';
COMMENT ON COLUMN admin.platform_email_settings.password_encrypted IS 'Senha SMTP / senha de app cifrada (AES-GCM)';
