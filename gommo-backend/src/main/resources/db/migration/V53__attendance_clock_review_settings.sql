ALTER TABLE attendance_record
    ADD COLUMN IF NOT EXISTS break_start TIME,
    ADD COLUMN IF NOT EXISTS break_end TIME,
    ADD COLUMN IF NOT EXISTS request_status VARCHAR(40),
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID,
    ADD COLUMN IF NOT EXISTS review_reason TEXT,
    ADD COLUMN IF NOT EXISTS photo_object_id UUID,
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS location_accuracy_meters NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS idx_attendance_request_status
    ON attendance_record (request_status, submitted_at)
    WHERE status != 'DELETED' AND request_status IS NOT NULL;

INSERT INTO system_setting (code, setting_key, setting_value, description)
SELECT
    COALESCE((SELECT MAX(code) FROM system_setting), 0) + 1,
    'ATTENDANCE_REQUIRE_PHOTO',
    'true',
    'Exige selfie no registro de ponto pelo Gommo Tick'
WHERE NOT EXISTS (
    SELECT 1 FROM system_setting WHERE setting_key = 'ATTENDANCE_REQUIRE_PHOTO' AND status != 'DELETED'
);

INSERT INTO system_setting (code, setting_key, setting_value, description)
SELECT
    COALESCE((SELECT MAX(code) FROM system_setting), 0) + 1,
    'ATTENDANCE_REQUIRE_LOCATION',
    'true',
    'Exige localizacao no registro de ponto pelo Gommo Tick'
WHERE NOT EXISTS (
    SELECT 1 FROM system_setting WHERE setting_key = 'ATTENDANCE_REQUIRE_LOCATION' AND status != 'DELETED'
);
