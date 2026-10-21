-- Corrige tipo da UF da empresa (CHAR(2) → VARCHAR(2)), alinhado ao formulário e validações.
ALTER TABLE company ALTER COLUMN state_code TYPE VARCHAR(2);
