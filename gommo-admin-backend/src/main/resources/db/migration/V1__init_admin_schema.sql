CREATE SCHEMA IF NOT EXISTS admin;

-- Usuários do painel administrativo (operadores da plataforma)
CREATE TABLE admin.admin_user (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          public.status_enum NOT NULL DEFAULT 'ACTIVE',
    username        VARCHAR(100) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    last_login      TIMESTAMPTZ,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_admin_user_username ON admin.admin_user (username) WHERE status != 'DELETED';
CREATE UNIQUE INDEX idx_admin_user_email ON admin.admin_user (email) WHERE status != 'DELETED';

-- Clientes (tenants) da plataforma Gommo
CREATE TABLE admin.client (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          public.status_enum NOT NULL DEFAULT 'ACTIVE',
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    document        VARCHAR(18),
    contact_email   VARCHAR(200),
    contact_phone   VARCHAR(20),
    notes           TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_client_slug ON admin.client (slug) WHERE status != 'DELETED';

-- Usuários vinculados a um cliente (acessam o gommo-frontend)
CREATE TABLE admin.client_user (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          public.status_enum NOT NULL DEFAULT 'ACTIVE',
    client_id       UUID NOT NULL REFERENCES admin.client(id),
    app_user_id     UUID NOT NULL REFERENCES public.app_user(id),
    display_name    VARCHAR(200),
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_client_user_app_user ON admin.client_user (app_user_id) WHERE status != 'DELETED';
CREATE INDEX idx_client_user_client ON admin.client_user (client_id);

-- Refresh tokens do painel admin (schema isolado)
CREATE TABLE admin.refresh_token (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES admin.admin_user(id),
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin.refresh_token_blacklist (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    revoked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
