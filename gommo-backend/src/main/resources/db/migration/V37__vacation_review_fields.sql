-- Workflow de revisao de solicitacao de ferias (RH -> DP)

ALTER TABLE leave_request
    ADD COLUMN IF NOT EXISTS justified_absences INT,
    ADD COLUMN IF NOT EXISTS review_status VARCHAR(20),
    ADD COLUMN IF NOT EXISTS review_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_leave_vacation_review
    ON leave_request (review_status)
    WHERE status != 'DELETED'
      AND leave_type = 'VACATION'
      AND approved IS DISTINCT FROM TRUE;
