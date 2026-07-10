-- Solicitações de ponto em tabela própria (histórico), separadas do ponto oficial.

CREATE TABLE IF NOT EXISTS attendance_request (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL,
    status                      status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id             UUID NOT NULL REFERENCES collaborator(id),
    work_date                   DATE NOT NULL,
    attendance_record_id        UUID REFERENCES attendance_record(id),
    original_clock_in           TIME,
    original_clock_out          TIME,
    original_break_start        TIME,
    original_break_end          TIME,
    original_break_minutes      INT,
    original_notes              TEXT,
    clock_in                    TIME,
    clock_out                   TIME,
    break_start                 TIME,
    break_end                   TIME,
    break_minutes               INT,
    expected_hours              NUMERIC(5, 2),
    worked_hours                NUMERIC(5, 2),
    notes                       TEXT,
    request_type                VARCHAR(40) NOT NULL,
    source                      VARCHAR(40),
    client_request_id           VARCHAR(80),
    submitted_at                TIMESTAMPTZ,
    request_status              VARCHAR(40) NOT NULL,
    reviewed_at                 TIMESTAMPTZ,
    reviewed_by                 UUID,
    review_reason               TEXT,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_attendance_request_code
    ON attendance_request (code);

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_request_source_client
    ON attendance_request (source, client_request_id)
    WHERE status != 'DELETED' AND client_request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_request_status_submitted
    ON attendance_request (request_status, submitted_at DESC)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_attendance_request_collaborator_date
    ON attendance_request (collaborator_id, work_date)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_attendance_request_record
    ON attendance_request (attendance_record_id)
    WHERE status != 'DELETED' AND attendance_record_id IS NOT NULL;

-- Migra linhas de solicitação que viviam em attendance_record.
INSERT INTO attendance_request (
    id,
    code,
    status,
    collaborator_id,
    work_date,
    attendance_record_id,
    original_clock_in,
    original_clock_out,
    original_break_start,
    original_break_end,
    original_break_minutes,
    original_notes,
    clock_in,
    clock_out,
    break_start,
    break_end,
    break_minutes,
    expected_hours,
    worked_hours,
    notes,
    request_type,
    source,
    client_request_id,
    submitted_at,
    request_status,
    reviewed_at,
    reviewed_by,
    review_reason,
    created_by,
    created_at,
    updated_by,
    updated_at
)
SELECT
    req.id,
    req.code,
    req.status,
    req.collaborator_id,
    req.work_date,
    CASE
        WHEN orig.id IS NOT NULL THEN req.reference_id
        ELSE NULL
    END,
    orig.clock_in,
    orig.clock_out,
    orig.break_start,
    orig.break_end,
    orig.break_minutes,
    orig.notes,
    req.clock_in,
    req.clock_out,
    req.break_start,
    req.break_end,
    req.break_minutes,
    req.expected_hours,
    req.worked_hours,
    req.notes,
    COALESCE(req.request_type, 'TIME_ADJUSTMENT'),
    req.source,
    req.client_request_id,
    req.submitted_at,
    req.request_status,
    req.reviewed_at,
    req.reviewed_by,
    req.review_reason,
    req.created_by,
    req.created_at,
    req.updated_by,
    req.updated_at
FROM attendance_record req
LEFT JOIN attendance_record orig
    ON orig.id = req.reference_id
   AND orig.status != 'DELETED'
   AND orig.request_status IS NULL
WHERE req.request_status IS NOT NULL
  AND req.status != 'DELETED';

-- Reaponta anexos das solicitações migradas.
UPDATE storage_object_link sol
SET entity_type = 'attendance_request'
WHERE sol.entity_type = 'attendance_record'
  AND sol.entity_id IN (SELECT id FROM attendance_request);

-- Remove linhas de solicitação do ponto oficial.
DELETE FROM attendance_record
WHERE request_status IS NOT NULL;

DROP INDEX IF EXISTS idx_attendance_source_client_request;
DROP INDEX IF EXISTS idx_attendance_source_submitted_at;
DROP INDEX IF EXISTS idx_attendance_request_status;
DROP INDEX IF EXISTS idx_attendance_collaborator_date;

ALTER TABLE attendance_record
    DROP COLUMN IF EXISTS request_type,
    DROP COLUMN IF EXISTS source,
    DROP COLUMN IF EXISTS client_request_id,
    DROP COLUMN IF EXISTS submitted_at,
    DROP COLUMN IF EXISTS request_status,
    DROP COLUMN IF EXISTS reviewed_at,
    DROP COLUMN IF EXISTS reviewed_by,
    DROP COLUMN IF EXISTS review_reason;

CREATE UNIQUE INDEX idx_attendance_collaborator_date
    ON attendance_record (collaborator_id, work_date)
    WHERE status != 'DELETED';
