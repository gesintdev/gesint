ALTER TABLE admission_process
    ADD COLUMN emergency_contact_name VARCHAR(200),
    ADD COLUMN emergency_contact_phone VARCHAR(20),
    ADD COLUMN emergency_contact_relationship VARCHAR(80),
    ADD COLUMN contract_start_date DATE,
    ADD COLUMN contract_end_date DATE,
    ADD COLUMN workload_schedule VARCHAR(32);

UPDATE admission_process
SET workload_schedule = TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM workload_hours::text)) || 'h'
WHERE workload_hours IS NOT NULL;

ALTER TABLE admission_process DROP COLUMN IF EXISTS workload_hours;

ALTER TABLE storage_object_link
    ADD COLUMN document_type VARCHAR(64);
