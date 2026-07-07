DO $$
BEGIN
    IF to_regtype('attendance_occurrence_type_enum') IS NOT NULL THEN
        ALTER TYPE attendance_occurrence_type_enum ADD VALUE IF NOT EXISTS 'TIME_ADJUSTMENT';
    END IF;
    IF to_regtype('attendance_occurrence_origin_enum') IS NOT NULL THEN
        ALTER TYPE attendance_occurrence_origin_enum ADD VALUE IF NOT EXISTS 'MOBILE';
    END IF;
END $$;

ALTER TABLE attendance_record
    ADD COLUMN IF NOT EXISTS request_type VARCHAR(40),
    ADD COLUMN IF NOT EXISTS source VARCHAR(40),
    ADD COLUMN IF NOT EXISTS client_request_id VARCHAR(80),
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

UPDATE attendance_record
SET source = 'BACKOFFICE'
WHERE source IS NULL
  AND status != 'DELETED';

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_source_client_request
    ON attendance_record (source, client_request_id)
    WHERE status != 'DELETED' AND client_request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_source_submitted_at
    ON attendance_record (source, submitted_at)
    WHERE status != 'DELETED' AND source IS NOT NULL;
