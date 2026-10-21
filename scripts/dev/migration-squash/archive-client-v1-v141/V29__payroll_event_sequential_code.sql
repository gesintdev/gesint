-- payroll_event and payslip_entry were created after V15 (global code backfill).
-- V26 added nullable code; V28 inserted default events without filling code.

CREATE OR REPLACE FUNCTION public.backfill_entity_code(p_table regclass)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_table text := p_table::text;
    v_index_prefix text := 'uk_' || replace(replace(v_table, 'public.', ''), '.', '_');
BEGIN
    EXECUTE format('ALTER TABLE %s ADD COLUMN IF NOT EXISTS code INTEGER', p_table);
    EXECUTE format(
        'UPDATE %s t SET code = s.rn FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM %s
        ) s WHERE t.id = s.id AND t.code IS NULL',
        p_table,
        p_table);
    EXECUTE format('ALTER TABLE %s ALTER COLUMN code SET NOT NULL', p_table);
    EXECUTE format('DROP INDEX IF EXISTS %I', v_index_prefix || '_code_seq');
    EXECUTE format(
        'CREATE UNIQUE INDEX IF NOT EXISTS %I ON %s (code)',
        v_index_prefix || '_code',
        p_table);
END;
$$;

SELECT public.backfill_entity_code('public.payroll_event'::regclass);
SELECT public.backfill_entity_code('public.payslip_entry'::regclass);

DO $backfill_tenant_payroll_codes$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_name IN ('payroll_event', 'payslip_entry')
          AND table_schema NOT IN ('public', 'admin', 'pg_catalog', 'information_schema')
    LOOP
        EXECUTE format(
            'SELECT public.backfill_entity_code(%L::regclass)',
            r.table_schema || '.' || r.table_name);
    END LOOP;
END;
$backfill_tenant_payroll_codes$;

DROP FUNCTION public.backfill_entity_code(regclass);

COMMENT ON COLUMN public.payroll_event.code IS 'Sequential integer code for payroll event';
COMMENT ON COLUMN public.payslip_entry.code IS 'Sequential integer code for payslip entry';
