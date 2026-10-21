-- Eventos de folha, lancamentos por holerite, campos de competencia e holerite

UPDATE payroll_run SET payroll_status = 'OPEN' WHERE payroll_status = 'DRAFT';

ALTER TABLE payroll_run ALTER COLUMN payroll_status SET DEFAULT 'OPEN';

ALTER TABLE payroll_run
    ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

ALTER TABLE payslip
    ADD COLUMN IF NOT EXISTS base_salary NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ;

CREATE TYPE payroll_event_type_enum AS ENUM ('EARNING', 'DEDUCTION', 'INFORMATIVE');

CREATE TABLE payroll_event (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    event_code          VARCHAR(30) NOT NULL,
    description         VARCHAR(200) NOT NULL,
    event_type          payroll_event_type_enum NOT NULL DEFAULT 'EARNING',
    incides_inss        BOOLEAN NOT NULL DEFAULT FALSE,
    incides_fgts        BOOLEAN NOT NULL DEFAULT FALSE,
    incides_irrf        BOOLEAN NOT NULL DEFAULT FALSE,
    formula             TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uk_payroll_event_code_active
    ON payroll_event (event_code)
    WHERE status != 'DELETED';

CREATE INDEX idx_payroll_event_type
    ON payroll_event (event_type)
    WHERE status != 'DELETED';

CREATE TABLE payslip_entry (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    payslip_id          UUID NOT NULL REFERENCES payslip(id),
    payroll_event_id    UUID NOT NULL REFERENCES payroll_event(id),
    quantity            NUMERIC(14, 4) NOT NULL DEFAULT 1,
    unit_value          NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_value         NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_payslip_entry_payslip
    ON payslip_entry (payslip_id)
    WHERE status != 'DELETED';

CREATE INDEX idx_payslip_entry_event
    ON payslip_entry (payroll_event_id)
    WHERE status != 'DELETED';

ALTER TABLE payroll_event ADD COLUMN IF NOT EXISTS code INTEGER;
ALTER TABLE payslip_entry ADD COLUMN IF NOT EXISTS code INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS uk_payroll_event_code_seq ON payroll_event (code) WHERE code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_payslip_entry_code_seq ON payslip_entry (code) WHERE code IS NOT NULL;
