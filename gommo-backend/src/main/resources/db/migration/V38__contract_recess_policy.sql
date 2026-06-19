CREATE TYPE recess_financial_mode_enum AS ENUM ('FULLY_PAID', 'UNPAID', 'PROPORTIONAL', 'CUSTOM');
CREATE TYPE recess_period_status_enum AS ENUM ('ACCRUING', 'AVAILABLE', 'EXHAUSTED', 'EXPIRED', 'CANCELLED');

CREATE TABLE contract_recess_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code INTEGER NOT NULL UNIQUE,
    status status_enum NOT NULL DEFAULT 'ACTIVE',
    employment_contract_id UUID NOT NULL REFERENCES employment_contract(id),
    enabled BOOLEAN NOT NULL DEFAULT false,
    total_days_per_cycle INTEGER,
    cycle_months INTEGER,
    eligibility_after_months INTEGER,
    financial_mode recess_financial_mode_enum,
    paid_percentage NUMERIC(5,2),
    allow_split BOOLEAN NOT NULL DEFAULT false,
    max_split_periods INTEGER,
    minimum_split_days INTEGER,
    advance_notice_days INTEGER NOT NULL DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_until DATE,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID,
    updated_at TIMESTAMPTZ,
    CONSTRAINT ck_recess_policy_days CHECK (enabled = false OR total_days_per_cycle > 0),
    CONSTRAINT ck_recess_policy_cycle CHECK (enabled = false OR cycle_months > 0),
    CONSTRAINT ck_recess_policy_wait CHECK (eligibility_after_months IS NULL OR eligibility_after_months >= 0),
    CONSTRAINT ck_recess_policy_percentage CHECK (
        paid_percentage IS NULL OR (paid_percentage >= 0 AND paid_percentage <= 100)
    )
);

CREATE INDEX idx_recess_policy_contract ON contract_recess_policy (employment_contract_id, effective_from DESC)
    WHERE status != 'DELETED';

CREATE TABLE contract_recess_period (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code INTEGER NOT NULL UNIQUE,
    status status_enum NOT NULL DEFAULT 'ACTIVE',
    policy_id UUID NOT NULL REFERENCES contract_recess_policy(id),
    collaborator_id UUID NOT NULL REFERENCES collaborator(id),
    cycle_start DATE NOT NULL,
    cycle_end DATE NOT NULL,
    entitled_days INTEGER NOT NULL,
    used_days INTEGER NOT NULL DEFAULT 0,
    reserved_days INTEGER NOT NULL DEFAULT 0,
    period_status recess_period_status_enum NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID,
    updated_at TIMESTAMPTZ,
    CONSTRAINT uk_recess_period_policy_cycle UNIQUE (policy_id, cycle_start),
    CONSTRAINT ck_recess_period_balance CHECK (
        entitled_days >= 0 AND used_days >= 0 AND reserved_days >= 0
        AND used_days + reserved_days <= entitled_days
    )
);

CREATE INDEX idx_recess_period_collaborator ON contract_recess_period (collaborator_id, cycle_start DESC)
    WHERE status != 'DELETED';

ALTER TABLE admission_process
    ADD COLUMN recess_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN recess_total_days_per_cycle INTEGER,
    ADD COLUMN recess_cycle_months INTEGER,
    ADD COLUMN recess_eligibility_after_months INTEGER,
    ADD COLUMN recess_financial_mode recess_financial_mode_enum,
    ADD COLUMN recess_paid_percentage NUMERIC(5,2),
    ADD COLUMN recess_allow_split BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN recess_max_split_periods INTEGER,
    ADD COLUMN recess_minimum_split_days INTEGER,
    ADD COLUMN recess_advance_notice_days INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN recess_notes TEXT;

ALTER TABLE leave_request
    ADD COLUMN recess_period_id UUID REFERENCES contract_recess_period(id),
    ADD COLUMN recess_financial_mode recess_financial_mode_enum,
    ADD COLUMN recess_paid_percentage NUMERIC(5,2);

CREATE INDEX idx_leave_request_recess_period ON leave_request (recess_period_id)
    WHERE status != 'DELETED';

