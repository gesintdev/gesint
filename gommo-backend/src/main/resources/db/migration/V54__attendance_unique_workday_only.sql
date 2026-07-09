DROP INDEX IF EXISTS idx_attendance_collaborator_date;

CREATE UNIQUE INDEX idx_attendance_collaborator_date
    ON attendance_record (collaborator_id, work_date)
    WHERE status != 'DELETED' AND request_status IS NULL;