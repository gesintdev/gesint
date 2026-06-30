CREATE TABLE IF NOT EXISTS competency (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    type            VARCHAR(32) NOT NULL,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_competency_name_active
    ON competency (LOWER(name))
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS proficiency_level (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    level_order     INTEGER NOT NULL,
    weight          INTEGER NOT NULL,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_proficiency_level_name_active
    ON proficiency_level (LOWER(name))
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_proficiency_level_order
    ON proficiency_level (level_order)
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS development_track (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_development_track_name_active
    ON development_track (LOWER(name))
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS development_track_competency (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id                UUID NOT NULL REFERENCES development_track(id) ON DELETE CASCADE,
    competency_id           UUID NOT NULL,
    competency_name         VARCHAR(200),
    expected_level_id       UUID,
    expected_level_order    INTEGER,
    required                BOOLEAN NOT NULL DEFAULT false,
    weight                  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_development_track_competency_track
    ON development_track_competency (track_id);

CREATE TABLE IF NOT EXISTS development_action_template (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL UNIQUE,
    status                      status_enum NOT NULL DEFAULT 'ACTIVE',
    competency_id               UUID NOT NULL,
    competency_name             VARCHAR(200),
    min_gap                     INTEGER NOT NULL,
    title                       VARCHAR(200) NOT NULL,
    suggested_description       TEXT,
    action_type                 VARCHAR(32) NOT NULL,
    suggested_deadline_days     INTEGER,
    evidence_required           BOOLEAN NOT NULL DEFAULT false,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_development_action_template_competency
    ON development_action_template (competency_id)
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS evidence_type (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    requires_file   BOOLEAN NOT NULL DEFAULT false,
    allows_link     BOOLEAN NOT NULL DEFAULT false,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_evidence_type_name_active
    ON evidence_type (LOWER(name))
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS development_plan_origin (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_development_plan_origin_name_active
    ON development_plan_origin (LOWER(name))
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS development_plan (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL UNIQUE,
    status                      status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id             UUID NOT NULL,
    collaborator_name           VARCHAR(200),
    registration_number         VARCHAR(60),
    job_position_id             UUID,
    job_position_name           VARCHAR(200),
    target_job_position_id      UUID,
    target_job_position_name    VARCHAR(200),
    department_id               UUID,
    department_name             VARCHAR(200),
    manager_id                  UUID,
    manager_name                VARCHAR(200),
    track_id                    UUID,
    track_name                  VARCHAR(200),
    origin_id                   UUID,
    origin_name                 VARCHAR(200),
    start_date                  DATE,
    end_date                    DATE,
    checkin_frequency           VARCHAR(24),
    checkin_frequency_days      INTEGER,
    plan_status                 VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    notes                       TEXT,
    progress                    INTEGER NOT NULL DEFAULT 0,
    last_checkin_at             DATE,
    approved_at                 TIMESTAMPTZ,
    approved_by                 UUID,
    completed_at                TIMESTAMPTZ,
    canceled_at                 TIMESTAMPTZ,
    cancel_reason               TEXT,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_development_plan_collaborator
    ON development_plan (collaborator_id)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_development_plan_manager
    ON development_plan (manager_id)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_development_plan_department
    ON development_plan (department_id)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_development_plan_status
    ON development_plan (plan_status)
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS development_plan_competency (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                 UUID NOT NULL REFERENCES development_plan(id) ON DELETE CASCADE,
    competency_id           UUID NOT NULL,
    competency_name         VARCHAR(200),
    current_level_id        UUID,
    current_level_order     INTEGER,
    expected_level_id       UUID,
    expected_level_order    INTEGER,
    gap                     INTEGER,
    priority                VARCHAR(24),
    notes                   TEXT
);

CREATE INDEX IF NOT EXISTS idx_development_plan_competency_plan
    ON development_plan_competency (plan_id);

CREATE TABLE IF NOT EXISTS development_plan_goal (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id             UUID NOT NULL REFERENCES development_plan(id) ON DELETE CASCADE,
    title               VARCHAR(240) NOT NULL,
    description         TEXT,
    competency_id       UUID,
    competency_name     VARCHAR(200),
    type                VARCHAR(40),
    expected_result     TEXT,
    success_indicator   TEXT,
    deadline            DATE,
    weight              INTEGER,
    status              VARCHAR(24),
    progress            INTEGER
);

CREATE INDEX IF NOT EXISTS idx_development_plan_goal_plan
    ON development_plan_goal (plan_id);

CREATE TABLE IF NOT EXISTS development_plan_action (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id             UUID NOT NULL REFERENCES development_plan_goal(id) ON DELETE CASCADE,
    title               VARCHAR(240) NOT NULL,
    description         TEXT,
    action_type         VARCHAR(32),
    assignee            VARCHAR(200),
    start_date          DATE,
    end_date            DATE,
    workload_hours      INTEGER,
    estimated_cost      NUMERIC(12, 2),
    evidence_required   BOOLEAN NOT NULL DEFAULT false,
    status              VARCHAR(24),
    progress            INTEGER,
    notes               TEXT
);

CREATE INDEX IF NOT EXISTS idx_development_plan_action_goal
    ON development_plan_action (goal_id);

CREATE TABLE IF NOT EXISTS development_plan_checkin (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                 UUID NOT NULL REFERENCES development_plan(id) ON DELETE CASCADE,
    date                    DATE NOT NULL,
    participants            TEXT,
    summary                 TEXT,
    perceived_progress      INTEGER,
    blockers                TEXT,
    next_steps              TEXT,
    collaborator_rating     INTEGER,
    manager_rating          INTEGER
);

CREATE INDEX IF NOT EXISTS idx_development_plan_checkin_plan_date
    ON development_plan_checkin (plan_id, date DESC);

CREATE TABLE IF NOT EXISTS development_plan_evidence (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                 UUID NOT NULL REFERENCES development_plan(id) ON DELETE CASCADE,
    evidence_type_id        UUID,
    evidence_type_name      VARCHAR(200),
    description             TEXT,
    file                    VARCHAR(400),
    link                    VARCHAR(600),
    goal_id                 UUID,
    action_id               UUID,
    date                    DATE,
    responsible_user_id     UUID,
    responsible_user_name   VARCHAR(200)
);

CREATE INDEX IF NOT EXISTS idx_development_plan_evidence_plan
    ON development_plan_evidence (plan_id);

CREATE INDEX IF NOT EXISTS idx_development_plan_evidence_action
    ON development_plan_evidence (action_id);

WITH defaults(name, description, level_order, weight) AS (
    VALUES
        ('Inicial', 'Conhecimento inicial ou em formacao.', 1, 1),
        ('Basico', 'Executa com apoio e supervisao.', 2, 2),
        ('Intermediario', 'Executa com autonomia em cenarios comuns.', 3, 3),
        ('Avancado', 'Domina cenarios complexos e orienta pares.', 4, 4),
        ('Referencia', 'Referencia tecnica ou comportamental para a organizacao.', 5, 5)
), missing AS (
    SELECT d.* FROM defaults d
    WHERE NOT EXISTS (
        SELECT 1 FROM proficiency_level p WHERE LOWER(p.name) = LOWER(d.name) AND p.status != 'DELETED'
    )
)
INSERT INTO proficiency_level (code, name, description, level_order, weight)
SELECT COALESCE((SELECT MAX(code) FROM proficiency_level), 0) + ROW_NUMBER() OVER (ORDER BY level_order),
       name, description, level_order, weight
FROM missing;

WITH defaults(name, description, requires_file, allows_link) AS (
    VALUES
        ('Certificado', 'Certificado de conclusao ou participacao.', true, true),
        ('Link de curso', 'URL de curso, aula ou trilha externa.', false, true),
        ('Documento', 'Documento anexado como evidencia.', true, false),
        ('Feedback', 'Registro de feedback recebido.', false, false),
        ('Entrega de projeto', 'Evidencia de entrega pratica vinculada ao PDI.', false, true),
        ('Print', 'Imagem ou captura de tela.', true, false),
        ('Comentario do gestor', 'Comentario validado pelo gestor responsavel.', false, false)
), missing AS (
    SELECT d.* FROM defaults d
    WHERE NOT EXISTS (
        SELECT 1 FROM evidence_type e WHERE LOWER(e.name) = LOWER(d.name) AND e.status != 'DELETED'
    )
)
INSERT INTO evidence_type (code, name, description, requires_file, allows_link)
SELECT COALESCE((SELECT MAX(code) FROM evidence_type), 0) + ROW_NUMBER() OVER (ORDER BY name),
       name, description, requires_file, allows_link
FROM missing;

WITH defaults(name, description) AS (
    VALUES
        ('Avaliacao de desempenho', 'PDI originado de avaliacao de desempenho.'),
        ('Feedback', 'PDI originado de feedback estruturado.'),
        ('Promocao', 'PDI para preparacao ou efetivacao de promocao.'),
        ('Mudanca de cargo', 'PDI relacionado a transicao de cargo.'),
        ('Baixo desempenho', 'PDI para correcao de desempenho abaixo do esperado.'),
        ('Sucessao', 'PDI relacionado a plano de sucessao.'),
        ('Onboarding', 'PDI para integracao de novo colaborador.'),
        ('Manual', 'PDI criado manualmente.')
), missing AS (
    SELECT d.* FROM defaults d
    WHERE NOT EXISTS (
        SELECT 1 FROM development_plan_origin o WHERE LOWER(o.name) = LOWER(d.name) AND o.status != 'DELETED'
    )
)
INSERT INTO development_plan_origin (code, name, description)
SELECT COALESCE((SELECT MAX(code) FROM development_plan_origin), 0) + ROW_NUMBER() OVER (ORDER BY name),
       name, description
FROM missing;

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('43000000-0000-0000-0000-000000000001', 9301, 'developmentplan', 'developmentplan:read', 'Visualizar PDI'),
    ('43000000-0000-0000-0000-000000000002', 9302, 'developmentplan', 'developmentplan:write', 'Criar e editar PDI'),
    ('43000000-0000-0000-0000-000000000003', 9303, 'developmentplan', 'developmentplan:delete', 'Excluir PDI'),
    ('43000000-0000-0000-0000-000000000004', 9304, 'developmentplan', 'developmentplan:approve', 'Aprovar PDI'),
    ('43000000-0000-0000-0000-000000000005', 9305, 'developmentplan', 'developmentplan:conclude', 'Concluir PDI'),
    ('43000000-0000-0000-0000-000000000006', 9306, 'developmentplan', 'developmentplan:cancel', 'Cancelar PDI'),
    ('43000000-0000-0000-0000-000000000007', 9307, 'developmentplan', 'developmentplan:dashboard', 'Visualizar dashboard de PDI'),
    ('43000000-0000-0000-0000-000000000008', 9308, 'developmentplanconfig', 'developmentplanconfig:read', 'Visualizar configuracoes de PDI'),
    ('43000000-0000-0000-0000-000000000009', 9309, 'developmentplanconfig', 'developmentplanconfig:write', 'Criar e editar configuracoes de PDI'),
    ('43000000-0000-0000-0000-000000000010', 9310, 'developmentplanconfig', 'developmentplanconfig:delete', 'Excluir configuracoes de PDI')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module IN ('developmentplan', 'developmentplanconfig')
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module IN ('developmentplan', 'developmentplanconfig') AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;