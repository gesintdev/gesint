ALTER TABLE payment_batch
    ADD COLUMN IF NOT EXISTS source_file_name VARCHAR(500);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_batch_period_source_file_active
    ON payment_batch (payment_period_id, lower(source_file_name))
    WHERE status != 'DELETED' AND source_file_name IS NOT NULL;
