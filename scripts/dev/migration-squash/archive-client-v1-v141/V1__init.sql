CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NOT_INFORMED');
CREATE TYPE marital_status_enum AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER');

-- PERSON
CREATE TABLE person (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    full_name       VARCHAR(200) NOT NULL,
    social_name     VARCHAR(200),
    cpf             VARCHAR(14) NOT NULL,
    rg              VARCHAR(20),
    birth_date      DATE NOT NULL,
    gender          gender_enum,
    marital_status  marital_status_enum,
    mother_name     VARCHAR(200),
    father_name     VARCHAR(200),
    nationality     VARCHAR(60) DEFAULT 'Brasileiro',
    pis_pasep       VARCHAR(20),
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_person_cpf ON person (cpf) WHERE status != 'DELETED';
CREATE INDEX idx_person_status ON person (status);
CREATE INDEX idx_person_full_name ON person (full_name);

-- AUTH
CREATE TABLE app_user (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    person_id       UUID REFERENCES person(id),
    username        VARCHAR(100) NOT NULL,
    email           VARCHAR(200) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    last_login      TIMESTAMPTZ,
    must_change_pwd BOOLEAN DEFAULT false,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_app_user_username ON app_user (username) WHERE status != 'DELETED';
CREATE UNIQUE INDEX idx_app_user_email ON app_user (email) WHERE status != 'DELETED';

CREATE TABLE role (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE permission (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(100) NOT NULL UNIQUE,
    module      VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE user_role (
    user_id UUID NOT NULL REFERENCES app_user(id),
    role_id UUID NOT NULL REFERENCES role(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_role_user ON user_role (user_id);

CREATE TABLE role_permission (
    role_id       UUID NOT NULL REFERENCES role(id),
    permission_id UUID NOT NULL REFERENCES permission(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE refresh_token (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES app_user(id),
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_token_user ON refresh_token (user_id);
CREATE INDEX idx_refresh_token_hash ON refresh_token (token_hash);

CREATE TABLE refresh_token_blacklist (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    revoked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(100) NOT NULL,
    entity_id   UUID NOT NULL,
    action      VARCHAR(20) NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    user_id     UUID,
    ip_address  INET,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_entity ON audit_log (entity_name, entity_id);
