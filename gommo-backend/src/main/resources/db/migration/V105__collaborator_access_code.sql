-- Codigo unico do colaborador para acesso mobile e registro de ponto (web/publico).

ALTER TABLE collaborator
    ADD COLUMN IF NOT EXISTS access_code VARCHAR(9);

CREATE UNIQUE INDEX IF NOT EXISTS uq_collaborator_access_code
    ON collaborator (access_code)
    WHERE access_code IS NOT NULL AND status <> 'DELETED';

COMMENT ON COLUMN collaborator.access_code IS
    'Codigo unico do colaborador para app mobile e registro de ponto web; enviado por e-mail futuramente';

CREATE OR REPLACE FUNCTION public.next_collaborator_access_code()
RETURNS text
LANGUAGE plpgsql
AS $fn$
DECLARE
    base_code text;
    check_digit int;
    sum_digits int;
    digit int;
    doubled int;
    should_double boolean;
    i int;
BEGIN
    base_code := lpad((floor(random() * 100000000))::bigint::text, 8, '0');
    sum_digits := 0;
    should_double := true;
    FOR i IN REVERSE 8..1 LOOP
        digit := substr(base_code, i, 1)::int;
        IF should_double THEN
            doubled := digit * 2;
            IF doubled > 9 THEN
                doubled := doubled - 9;
            END IF;
            sum_digits := sum_digits + doubled;
        ELSE
            sum_digits := sum_digits + digit;
        END IF;
        should_double := NOT should_double;
    END LOOP;
    check_digit := (10 - (sum_digits % 10)) % 10;
    RETURN base_code || check_digit::text;
END
$fn$;

DO $backfill_public$
DECLARE
    row_id uuid;
    candidate text;
    attempts int;
    taken boolean;
BEGIN
    FOR row_id IN
        SELECT id
        FROM collaborator
        WHERE access_code IS NULL
          AND status <> 'DELETED'
    LOOP
        attempts := 0;
        LOOP
            candidate := public.next_collaborator_access_code();
            SELECT EXISTS (
                SELECT 1
                FROM collaborator
                WHERE access_code = candidate
                  AND status <> 'DELETED'
            )
            INTO taken;
            EXIT WHEN NOT taken;
            attempts := attempts + 1;
            IF attempts > 40 THEN
                RAISE EXCEPTION 'Nao foi possivel gerar access_code unico para collaborator %', row_id;
            END IF;
        END LOOP;
        UPDATE collaborator SET access_code = candidate WHERE id = row_id;
    END LOOP;
END
$backfill_public$;

DO $sync_tenants$
DECLARE
    target_schema text;
    row_id uuid;
    candidate text;
    attempts int;
    taken boolean;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.collaborator', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format(
            'ALTER TABLE %I.collaborator ADD COLUMN IF NOT EXISTS access_code VARCHAR(9)',
            target_schema
        );

        EXECUTE format(
            'CREATE UNIQUE INDEX IF NOT EXISTS uq_collaborator_access_code
             ON %I.collaborator (access_code)
             WHERE access_code IS NOT NULL AND status <> ''DELETED''',
            target_schema
        );

        FOR row_id IN EXECUTE format(
            'SELECT id FROM %I.collaborator WHERE access_code IS NULL AND status <> ''DELETED''',
            target_schema
        )
        LOOP
            attempts := 0;
            LOOP
                candidate := public.next_collaborator_access_code();
                EXECUTE format(
                    'SELECT EXISTS (
                        SELECT 1 FROM %I.collaborator
                        WHERE access_code = $1 AND status <> ''DELETED''
                     )',
                    target_schema
                )
                INTO taken
                USING candidate;
                EXIT WHEN NOT taken;
                attempts := attempts + 1;
                IF attempts > 40 THEN
                    RAISE EXCEPTION
                        'Nao foi possivel gerar access_code unico em % para collaborator %',
                        target_schema,
                        row_id;
                END IF;
            END LOOP;

            EXECUTE format(
                'UPDATE %I.collaborator SET access_code = $1 WHERE id = $2',
                target_schema
            )
            USING candidate, row_id;
        END LOOP;
    END LOOP;
END
$sync_tenants$;
