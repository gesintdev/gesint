ALTER TABLE admin.client ADD COLUMN IF NOT EXISTS mobile_login_code VARCHAR(9);

CREATE OR REPLACE FUNCTION admin.mobile_login_luhn_check_digit(p_base text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    v_sum integer := 0;
    v_digit integer;
    v_double boolean := true;
    v_index integer;
BEGIN
    FOR v_index IN REVERSE length(p_base)..1 LOOP
        v_digit := substr(p_base, v_index, 1)::integer;
        IF v_double THEN
            v_digit := v_digit * 2;
            IF v_digit > 9 THEN
                v_digit := v_digit - 9;
            END IF;
        END IF;
        v_sum := v_sum + v_digit;
        v_double := NOT v_double;
    END LOOP;

    RETURN ((10 - (v_sum % 10)) % 10)::text;
END;
$$;

WITH numbered_clients AS (
    SELECT
        id,
        ((((row_number() OVER (ORDER BY created_at, id) * 7919 + 1234567) % 90000000) + 10000000)::text) AS base_code
    FROM admin.client
    WHERE mobile_login_code IS NULL
)
UPDATE admin.client c
SET mobile_login_code = n.base_code || admin.mobile_login_luhn_check_digit(n.base_code)
FROM numbered_clients n
WHERE c.id = n.id;

ALTER TABLE admin.client ALTER COLUMN mobile_login_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_mobile_login_code
    ON admin.client (mobile_login_code)
    WHERE status != 'DELETED';

DROP FUNCTION admin.mobile_login_luhn_check_digit(text);
