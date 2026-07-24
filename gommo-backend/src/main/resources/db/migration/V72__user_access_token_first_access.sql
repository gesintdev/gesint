-- Token de primeiro acesso / redefinicao de senha em app_user.

ALTER TABLE app_user
    ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS access_token_hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS first_access_completed BOOLEAN;

UPDATE app_user
SET first_access_completed = NOT COALESCE(must_change_pwd, false)
WHERE first_access_completed IS NULL;

ALTER TABLE app_user
    ALTER COLUMN first_access_completed SET DEFAULT false;

ALTER TABLE app_user
    ALTER COLUMN first_access_completed SET NOT NULL;

ALTER TABLE app_user
    DROP COLUMN IF EXISTS must_change_pwd;

CREATE INDEX IF NOT EXISTS idx_app_user_access_token_hash
    ON app_user (access_token_hash)
    WHERE access_token_hash IS NOT NULL AND status <> 'DELETED';

DO $sync_user_access_token$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.app_user', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format('ALTER TABLE %I.app_user ALTER COLUMN password_hash DROP NOT NULL', target_schema);
        EXECUTE format(
            'ALTER TABLE %I.app_user ADD COLUMN IF NOT EXISTS access_token_hash VARCHAR(64)',
            target_schema
        );
        EXECUTE format(
            'ALTER TABLE %I.app_user ADD COLUMN IF NOT EXISTS first_access_completed BOOLEAN',
            target_schema
        );
        EXECUTE format(
            'UPDATE %I.app_user SET first_access_completed = NOT COALESCE(must_change_pwd, false) WHERE first_access_completed IS NULL',
            target_schema
        );
        EXECUTE format(
            'ALTER TABLE %I.app_user ALTER COLUMN first_access_completed SET DEFAULT false',
            target_schema
        );
        EXECUTE format(
            'ALTER TABLE %I.app_user ALTER COLUMN first_access_completed SET NOT NULL',
            target_schema
        );
        EXECUTE format('ALTER TABLE %I.app_user DROP COLUMN IF EXISTS must_change_pwd', target_schema);
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON %I.app_user (access_token_hash) WHERE access_token_hash IS NOT NULL AND status <> ''DELETED''',
            'idx_' || target_schema || '_app_user_access_token_hash',
            target_schema
        );
    END LOOP;
END
$sync_user_access_token$;
