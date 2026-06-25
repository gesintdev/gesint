CREATE TYPE leave_absence_status_enum AS ENUM (
    'PENDING',
    'VALIDATED',
    'REFERRED_INSS',
    'APPROVED_INSS',
    'FINALIZED',
    'CANCELLED'
);

CREATE TYPE attendance_occurrence_type_enum AS ENUM (
    'NORMAL_WORK',
    'MEDICAL_CERTIFICATE',
    'LEAVE_ABSENCE',
    'UNJUSTIFIED_ABSENCE',
    'LATE_ARRIVAL',
    'VACATION',
    'LICENSE'
);

CREATE TYPE attendance_occurrence_origin_enum AS ENUM (
    'MANUAL',
    'LEAVE_REQUEST'
);

ALTER TABLE leave_request
    ADD COLUMN IF NOT EXISTS absence_status leave_absence_status_enum,
    ADD COLUMN IF NOT EXISTS duration_days INT,
    ADD COLUMN IF NOT EXISTS cid VARCHAR(20),
    ADD COLUMN IF NOT EXISTS physician_name VARCHAR(180),
    ADD COLUMN IF NOT EXISTS physician_crm VARCHAR(40),
    ADD COLUMN IF NOT EXISTS certificate_source VARCHAR(80),
    ADD COLUMN IF NOT EXISTS requires_inss BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS inss_referral_date DATE,
    ADD COLUMN IF NOT EXISTS return_date DATE,
    ADD COLUMN IF NOT EXISTS work_accident_stability BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS related_certificate_days INT;

UPDATE leave_request
SET absence_status = CASE
        WHEN leave_type = 'VACATION' THEN NULL
        WHEN approved = TRUE THEN 'VALIDATED'::leave_absence_status_enum
        ELSE 'PENDING'::leave_absence_status_enum
    END,
    duration_days = (end_date - start_date + 1),
    requires_inss = CASE
        WHEN leave_type <> 'VACATION' AND (end_date - start_date + 1) > 15 THEN TRUE
        ELSE requires_inss
    END
WHERE status != 'DELETED';

ALTER TABLE attendance_record
    ADD COLUMN IF NOT EXISTS occurrence_type attendance_occurrence_type_enum NOT NULL DEFAULT 'NORMAL_WORK',
    ADD COLUMN IF NOT EXISTS occurrence_origin attendance_occurrence_origin_enum NOT NULL DEFAULT 'MANUAL',
    ADD COLUMN IF NOT EXISTS reference_id UUID,
    ADD COLUMN IF NOT EXISTS expected_hours NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS worked_hours NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS impacts_hour_bank BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS impacts_payroll BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_leave_absence_collaborator_period
    ON leave_request (collaborator_id, start_date, end_date)
    WHERE status != 'DELETED' AND leave_type != 'VACATION';

CREATE INDEX IF NOT EXISTS idx_leave_absence_cid
    ON leave_request (collaborator_id, cid, start_date)
    WHERE status != 'DELETED' AND cid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_reference
    ON attendance_record (occurrence_origin, reference_id)
    WHERE status != 'DELETED';
