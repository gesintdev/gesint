-- Vigência em planos de benefício + vínculos colaborador (benefício, fiscal, desempenho)

ALTER TABLE benefit_plan
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE;

CREATE TYPE tax_obligation_type_enum AS ENUM ('IRRF', 'INSS', 'FGTS', 'OTHER');
CREATE TYPE performance_rating_enum AS ENUM ('NEEDS_IMPROVEMENT', 'MEETS', 'EXCEEDS', 'OUTSTANDING');

CREATE TABLE benefit_enrollment (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    benefit_plan_id     UUID NOT NULL REFERENCES benefit_plan(id),
    start_date          DATE NOT NULL,
    end_date            DATE,
    monthly_value       NUMERIC(14, 2),
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_benefit_enrollment_collaborator
    ON benefit_enrollment (collaborator_id)
    WHERE status != 'DELETED';

CREATE TABLE tax_obligation (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    obligation_type     tax_obligation_type_enum NOT NULL DEFAULT 'IRRF',
    reference_code      VARCHAR(60),
    start_date          DATE NOT NULL,
    end_date            DATE,
    base_amount         NUMERIC(14, 2),
    rate_percent        NUMERIC(5, 2),
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_tax_obligation_collaborator
    ON tax_obligation (collaborator_id)
    WHERE status != 'DELETED';

CREATE TABLE performance_review (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    rating              performance_rating_enum,
    goals_summary       TEXT,
    feedback            TEXT,
    reviewer_name       VARCHAR(200),
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_performance_review_collaborator
    ON performance_review (collaborator_id)
    WHERE status != 'DELETED';
