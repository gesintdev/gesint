-- Auditoria de quem revisou/concedeu ferias (padrao attendance_request)

ALTER TABLE leave_request
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID;

UPDATE leave_request
SET reviewed_by = updated_by,
    reviewed_at = COALESCE(updated_at, created_at)
WHERE reviewed_by IS NULL
  AND (
        approved = TRUE
        OR review_status IN ('APPROVED', 'RETURNED', 'REJECTED')
      )
  AND updated_by IS NOT NULL;
