-- Campos específicos de férias (CLT) em leave_request

ALTER TABLE leave_request
    ADD COLUMN IF NOT EXISTS pecuniary_allowance_days INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS unjustified_absences INT,
    ADD COLUMN IF NOT EXISTS vacation_days_entitled INT,
    ADD COLUMN IF NOT EXISTS acquisition_period_start DATE,
    ADD COLUMN IF NOT EXISTS acquisition_period_end DATE,
    ADD COLUMN IF NOT EXISTS split_group_id UUID,
    ADD COLUMN IF NOT EXISTS split_sequence INT,
    ADD COLUMN IF NOT EXISTS base_salary_snapshot NUMERIC(14, 2);

CREATE INDEX IF NOT EXISTS idx_leave_split_group ON leave_request (split_group_id)
    WHERE status != 'DELETED' AND split_group_id IS NOT NULL;
