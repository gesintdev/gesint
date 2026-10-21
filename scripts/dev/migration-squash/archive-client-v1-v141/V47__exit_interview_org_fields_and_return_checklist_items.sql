ALTER TABLE exit_interview
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES department(id),
    ADD COLUMN IF NOT EXISTS job_position_id UUID REFERENCES job_position(id);

CREATE INDEX IF NOT EXISTS idx_exit_interview_department
    ON exit_interview (department_id)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_exit_interview_job_position
    ON exit_interview (job_position_id)
    WHERE status != 'DELETED';

CREATE TABLE IF NOT EXISTS exit_interview_return_checklist_item (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    item_key        VARCHAR(80) NOT NULL,
    description     VARCHAR(160) NOT NULL,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_exit_interview_return_checklist_item_key_active
    ON exit_interview_return_checklist_item (LOWER(item_key))
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_exit_interview_return_checklist_item_order
    ON exit_interview_return_checklist_item (display_order, description)
    WHERE status != 'DELETED';

WITH defaults(item_key, description, display_order) AS (
    VALUES
        ('notebook', 'Notebook', 10),
        ('phone', 'Celular', 20),
        ('badge', 'Crachá', 30),
        ('keys', 'Chaves', 40),
        ('corporate_card', 'Cartão corporativo', 50),
        ('uniform', 'Uniforme', 60),
        ('tools', 'Ferramentas', 70),
        ('vehicle', 'Veículo', 80),
        ('token', 'Token', 90),
        ('digital_certificate', 'Certificado digital', 100),
        ('other', 'Outros', 110)
), missing_defaults AS (
    SELECT d.*
    FROM defaults d
    WHERE NOT EXISTS (
        SELECT 1
        FROM exit_interview_return_checklist_item i
        WHERE LOWER(i.item_key) = LOWER(d.item_key)
          AND i.status != 'DELETED'
    )
)
INSERT INTO exit_interview_return_checklist_item (code, item_key, description, display_order)
SELECT
    COALESCE((SELECT MAX(code) FROM exit_interview_return_checklist_item), 0)
        + ROW_NUMBER() OVER (ORDER BY display_order),
    item_key,
    description,
    display_order
FROM missing_defaults;
