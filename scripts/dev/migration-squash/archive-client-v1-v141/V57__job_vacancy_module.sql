CREATE TABLE IF NOT EXISTS job_vacancy (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL UNIQUE,
    status                      status_enum NOT NULL DEFAULT 'ACTIVE',
    job_position_id             UUID,
    job_title                   VARCHAR(200) NOT NULL,
    positions_count             INTEGER NOT NULL DEFAULT 1,
    description                 TEXT,
    activities                  TEXT,
    assignments                 TEXT,
    seniority_level             VARCHAR(32),
    expected_completion_date    DATE,
    target_boards               JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_vacancy_job_position
    ON job_vacancy (job_position_id)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_vacancy_seniority
    ON job_vacancy (seniority_level)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_vacancy_expected_completion
    ON job_vacancy (expected_completion_date)
    WHERE status != 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('44000000-0000-0000-0000-000000000001', 9401, 'jobvacancy', 'jobvacancy:read', 'Visualizar vagas'),
    ('44000000-0000-0000-0000-000000000002', 9402, 'jobvacancy', 'jobvacancy:write', 'Criar e editar vagas'),
    ('44000000-0000-0000-0000-000000000003', 9403, 'jobvacancy', 'jobvacancy:delete', 'Excluir vagas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'jobvacancy'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module = 'jobvacancy' AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;
