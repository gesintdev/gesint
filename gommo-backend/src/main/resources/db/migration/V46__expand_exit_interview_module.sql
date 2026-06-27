-- Entrevista de desligamento: dados estruturados para acompanhamento, conclusao,
-- cancelamento, anexos e indicadores futuros.

ALTER TABLE exit_interview
    ADD COLUMN IF NOT EXISTS interview_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(16) NOT NULL DEFAULT 'CLT',
    ADD COLUMN IF NOT EXISTS collaborator_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS registration_number VARCHAR(60),
    ADD COLUMN IF NOT EXISTS job_position_name VARCHAR(160),
    ADD COLUMN IF NOT EXISTS department_name VARCHAR(160),
    ADD COLUMN IF NOT EXISTS company_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS manager_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS admission_or_contract_start_date DATE,
    ADD COLUMN IF NOT EXISTS termination_or_contract_end_date DATE,
    ADD COLUMN IF NOT EXISTS tenure_days INTEGER,
    ADD COLUMN IF NOT EXISTS termination_type VARCHAR(64),
    ADD COLUMN IF NOT EXISTS interviewer_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS main_reason VARCHAR(64),
    ADD COLUMN IF NOT EXISTS secondary_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS detailed_reason TEXT,
    ADD COLUMN IF NOT EXISTS ratings JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS open_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS would_return VARCHAR(16),
    ADD COLUMN IF NOT EXISTS company_would_rehire VARCHAR(16),
    ADD COLUMN IF NOT EXISTS rehire_notes TEXT,
    ADD COLUMN IF NOT EXISTS return_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS template_key VARCHAR(100),
    ADD COLUMN IF NOT EXISTS template_version INTEGER,
    ADD COLUMN IF NOT EXISTS template_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

UPDATE exit_interview
SET collaborator_name = COALESCE(collaborator_name, c.full_name)
FROM collaborator c
WHERE exit_interview.collaborator_id = c.id;

UPDATE exit_interview
SET detailed_reason = COALESCE(detailed_reason, feedback),
    main_reason = COALESCE(main_reason, 'OTHER')
WHERE feedback IS NOT NULL OR departure_reason IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exit_interview_interview_status
    ON exit_interview (interview_status)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_exit_interview_relationship_type
    ON exit_interview (relationship_type)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_exit_interview_termination_type
    ON exit_interview (termination_type)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_exit_interview_main_reason
    ON exit_interview (main_reason)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_exit_interview_interview_date
    ON exit_interview (interview_date)
    WHERE status != 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('42000000-0000-0000-0000-000000000123', 9201, 'exitinterview', 'exitinterview:complete', 'Concluir entrevista de desligamento'),
    ('42000000-0000-0000-0000-000000000124', 9202, 'exitinterview', 'exitinterview:cancel', 'Cancelar entrevista de desligamento'),
    ('42000000-0000-0000-0000-000000000125', 9203, 'exitinterview', 'exitinterview:attach', 'Anexar documentos da entrevista de desligamento')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'exitinterview'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module = 'exitinterview' AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;