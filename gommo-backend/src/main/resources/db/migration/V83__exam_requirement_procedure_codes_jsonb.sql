-- Alinha complementary_procedure_codes ao padrao do projeto (List<String> via JSONB),
-- como job_vacancy.target_boards. Ambientes que ja rodaram V80 com TEXT[] sao migrados aqui.

DO $fix_exam_requirement_codes$
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
              AND table_name = 'exam_requirement'
              AND column_name = 'complementary_procedure_codes'
              AND udt_name = '_text'
        ) THEN
            EXECUTE format(
                $sql$
                ALTER TABLE %I.exam_requirement
                    ALTER COLUMN complementary_procedure_codes TYPE jsonb
                    USING CASE
                        WHEN complementary_procedure_codes IS NULL THEN NULL
                        ELSE to_jsonb(complementary_procedure_codes)
                    END
                $sql$,
                sch
            );
        END IF;
    END LOOP;
END
$fix_exam_requirement_codes$;
