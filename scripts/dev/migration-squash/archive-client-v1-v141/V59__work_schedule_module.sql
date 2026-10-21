-- Escalas de trabalho (quadro de horários) + vínculo na admissão

CREATE TABLE IF NOT EXISTS work_schedule (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_work_schedule_status
    ON work_schedule (status)
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS work_schedule_day (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_schedule_id    UUID NOT NULL REFERENCES work_schedule (id) ON DELETE CASCADE,
    day_of_week         VARCHAR(16) NOT NULL,
    period1_start       TIME,
    period1_end         TIME,
    period2_start       TIME,
    period2_end         TIME,
    CONSTRAINT uq_work_schedule_day UNIQUE (work_schedule_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_work_schedule_day_schedule
    ON work_schedule_day (work_schedule_id);

ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS work_schedule_id UUID;

CREATE INDEX IF NOT EXISTS idx_admission_process_work_schedule
    ON admission_process (work_schedule_id)
    WHERE work_schedule_id IS NOT NULL AND status != 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('45000000-0000-0000-0000-000000000001', 9501, 'workschedule', 'workschedule:read', 'Visualizar escalas'),
    ('45000000-0000-0000-0000-000000000002', 9502, 'workschedule', 'workschedule:write', 'Criar e editar escalas'),
    ('45000000-0000-0000-0000-000000000003', 9503, 'workschedule', 'workschedule:delete', 'Excluir escalas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'workschedule'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module = 'workschedule' AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;
