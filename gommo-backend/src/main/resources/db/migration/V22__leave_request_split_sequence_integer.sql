-- Alinha split_sequence com Integer no JPA (V21 usava SMALLINT em alguns ambientes)

ALTER TABLE leave_request
    ALTER COLUMN split_sequence TYPE INTEGER
    USING split_sequence::integer;
