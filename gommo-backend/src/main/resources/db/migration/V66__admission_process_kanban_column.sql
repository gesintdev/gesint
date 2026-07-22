CREATE TABLE IF NOT EXISTS admission_process_kanban_column (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    column_key      VARCHAR(80) NOT NULL,
    name            VARCHAR(120) NOT NULL,
    color           VARCHAR(7),
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_admission_process_kanban_column_key_active
    ON admission_process_kanban_column (LOWER(column_key))
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_admission_process_kanban_column_order
    ON admission_process_kanban_column (display_order, name)
    WHERE status != 'DELETED';

WITH defaults(column_key, name, display_order) AS (
    VALUES
        ('resume_analysis', 'Análise de Currículo', 10),
        ('cultural_fit', 'Fit Cultural', 20),
        ('behavioral_assessment', 'Avaliação Comportamental', 30),
        ('initial_interview', 'Entrevista Inicial', 40),
        ('manager_interview', 'Entrevista Com Gestor', 50),
        ('pre_approval', 'Pré-aprovação', 60),
        ('hiring', 'Contratação', 70)
), missing_defaults AS (
    SELECT d.*
    FROM defaults d
    WHERE NOT EXISTS (
        SELECT 1
        FROM admission_process_kanban_column c
        WHERE LOWER(c.column_key) = LOWER(d.column_key)
          AND c.status != 'DELETED'
    )
)
INSERT INTO admission_process_kanban_column (code, column_key, name, display_order)
SELECT
    COALESCE((SELECT MAX(code) FROM admission_process_kanban_column), 0)
        + ROW_NUMBER() OVER (ORDER BY display_order),
    column_key,
    name,
    display_order
FROM missing_defaults;
