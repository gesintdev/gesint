-- Portal do candidato (RN-33 / D8): conta externa isolada dos usuarios do tenant.
-- Sessao propria (JWT principal=candidate); e-mail/senha ou Google.

CREATE TABLE IF NOT EXISTS candidate_account (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                INTEGER NOT NULL UNIQUE,
    status              gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    candidate_id        UUID NOT NULL REFERENCES candidate (id),
    email               VARCHAR(200) NOT NULL,
    password_hash       VARCHAR(100),
    google_sub          VARCHAR(128),
    full_name           VARCHAR(200) NOT NULL,
    phone               VARCHAR(20),
    email_verified      BOOLEAN NOT NULL DEFAULT false,
    last_login_at       TIMESTAMPTZ,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_candidate_account_email_active
    ON candidate_account (lower(email))
    WHERE status <> 'DELETED';

CREATE UNIQUE INDEX IF NOT EXISTS uk_candidate_account_candidate_active
    ON candidate_account (candidate_id)
    WHERE status <> 'DELETED';

CREATE UNIQUE INDEX IF NOT EXISTS uk_candidate_account_google_sub_active
    ON candidate_account (google_sub)
    WHERE status <> 'DELETED' AND google_sub IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidate_account_candidate
    ON candidate_account (candidate_id)
    WHERE status <> 'DELETED';

SELECT public.gommo_audit_sync_table('candidate_account');
