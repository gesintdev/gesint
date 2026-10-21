-- Agenda pessoal (eventos do usuário logado)

CREATE TABLE IF NOT EXISTS agenda_event (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    owner_user_id   UUID NOT NULL,
    title           VARCHAR(200) NOT NULL,
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    location        VARCHAR(255),
    description     TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ,
    CONSTRAINT ck_agenda_event_range CHECK (ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS idx_agenda_event_owner_starts
    ON agenda_event (owner_user_id, starts_at)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_agenda_event_status
    ON agenda_event (status)
    WHERE status != 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('46000000-0000-0000-0000-000000000001', 9601, 'agenda', 'agenda:read', 'Visualizar agenda pessoal'),
    ('46000000-0000-0000-0000-000000000002', 9602, 'agenda', 'agenda:write', 'Criar e editar agenda pessoal'),
    ('46000000-0000-0000-0000-000000000003', 9603, 'agenda', 'agenda:delete', 'Excluir agenda pessoal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'agenda'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module = 'agenda' AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;
