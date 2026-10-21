-- Alinha crm_state ao padrao do projeto (VARCHAR(2)), como rg_state_code / state_code.
-- Ambientes que ja rodaram V80 com CHAR(2) sao migrados aqui.

DO $fix_physician_crm_state$
DECLARE
    target_schema text;
    schemas text[] := ARRAY['public'];
    sch text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        schemas := array_append(schemas, target_schema);
    END LOOP;

    FOREACH sch IN ARRAY schemas LOOP
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = sch
              AND table_name = 'occupational_physician'
              AND column_name = 'crm_state'
              AND udt_name = 'bpchar'
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.occupational_physician ALTER COLUMN crm_state TYPE VARCHAR(2)',
                sch
            );
        END IF;
    END LOOP;
END
$fix_physician_crm_state$;
