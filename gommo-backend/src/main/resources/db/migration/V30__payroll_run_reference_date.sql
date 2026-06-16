-- Unified payroll competence (first day of month) and removal of company_id from payroll_run.

CREATE OR REPLACE FUNCTION public.migrate_payroll_run_competence(p_table regclass)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_schema text;
    v_table text;
    v_index_name text;
BEGIN
    SELECT n.nspname, c.relname
    INTO v_schema, v_table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.oid = p_table;

    EXECUTE format('ALTER TABLE %s ADD COLUMN IF NOT EXISTS reference_date DATE', p_table);

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = v_schema
          AND table_name = v_table
          AND column_name = 'reference_year'
    ) THEN
        EXECUTE format(
            'UPDATE %s SET reference_date = make_date(reference_year, reference_month, 1)
             WHERE reference_date IS NULL
               AND reference_year IS NOT NULL
               AND reference_month IS NOT NULL',
            p_table);
    END IF;

    EXECUTE format('ALTER TABLE %s ALTER COLUMN reference_date SET NOT NULL', p_table);

    SELECT indexname
    INTO v_index_name
    FROM pg_indexes
    WHERE schemaname = v_schema
      AND tablename = v_table
      AND indexname LIKE '%payroll_run_period%'
    LIMIT 1;

    IF v_index_name IS NOT NULL THEN
        EXECUTE format('DROP INDEX IF EXISTS %I.%I', v_schema, v_index_name);
    END IF;

    EXECUTE format(
        'CREATE UNIQUE INDEX IF NOT EXISTS %I ON %s (reference_date) WHERE status != ''DELETED''',
        'idx_' || v_schema || '_payroll_run_reference_date',
        p_table);

    EXECUTE format('ALTER TABLE %s DROP COLUMN IF EXISTS company_id', p_table);
    EXECUTE format('ALTER TABLE %s DROP COLUMN IF EXISTS reference_year', p_table);
    EXECUTE format('ALTER TABLE %s DROP COLUMN IF EXISTS reference_month', p_table);
END;
$$;

SELECT public.migrate_payroll_run_competence('public.payroll_run'::regclass);

DO $migrate_tenant_payroll_run$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT table_schema
        FROM information_schema.tables
        WHERE table_name = 'payroll_run'
          AND table_schema NOT IN ('public', 'admin', 'pg_catalog', 'information_schema')
    LOOP
        EXECUTE format(
            'SELECT public.migrate_payroll_run_competence(%L::regclass)',
            r.table_schema || '.payroll_run');
    END LOOP;
END;
$migrate_tenant_payroll_run$;

DROP FUNCTION public.migrate_payroll_run_competence(regclass);

COMMENT ON COLUMN public.payroll_run.reference_date IS 'Payroll competence date (first day of month)';
