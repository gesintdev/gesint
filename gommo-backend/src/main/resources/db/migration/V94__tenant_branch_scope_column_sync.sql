-- Espelha colunas de escopo por filial (V89/V92) do template public para todos os tenant_*.

DO $sync_tenant_branch_scope_columns$
DECLARE
    target_schema text;
    scoped_table text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.company', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.company ADD COLUMN IF NOT EXISTS parent_id UUID',
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.company ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN NOT NULL DEFAULT false',
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.company ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0',
                target_schema
            );
        END IF;

        FOR scoped_table IN
            SELECT c.table_name
            FROM information_schema.columns c
            WHERE c.table_schema = 'public'
              AND c.column_name = 'company_id'
              AND c.table_name <> 'company'
            ORDER BY c.table_name
        LOOP
            IF to_regclass(format('%I.%I', target_schema, scoped_table)) IS NULL THEN
                CONTINUE;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns tc
                WHERE tc.table_schema = target_schema
                  AND tc.table_name = scoped_table
                  AND tc.column_name = 'company_id'
            ) THEN
                CONTINUE;
            END IF;

            EXECUTE format(
                'ALTER TABLE %I.%I ADD COLUMN company_id UUID',
                target_schema,
                scoped_table
            );
        END LOOP;
    END LOOP;
END
$sync_tenant_branch_scope_columns$;
