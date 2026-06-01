UPDATE admission_process
SET admission_status = 'IN_PROGRESS'
WHERE admission_status = 'DRAFT';

ALTER TABLE admission_process
    ALTER COLUMN admission_status SET DEFAULT 'IN_PROGRESS';
