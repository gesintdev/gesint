ALTER TABLE payment_batch
    ADD COLUMN IF NOT EXISTS processing_page INTEGER,
    ADD COLUMN IF NOT EXISTS total_pages INTEGER;
