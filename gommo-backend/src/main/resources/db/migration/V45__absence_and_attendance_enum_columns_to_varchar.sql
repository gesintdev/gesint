ALTER TABLE leave_request
    ALTER COLUMN absence_status TYPE VARCHAR(30)
    USING absence_status::text;

ALTER TABLE attendance_record
    ALTER COLUMN occurrence_type TYPE VARCHAR(40)
    USING occurrence_type::text,
    ALTER COLUMN occurrence_origin TYPE VARCHAR(40)
    USING occurrence_origin::text;
