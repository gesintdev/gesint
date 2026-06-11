-- payment_* tables were created in V31 without integer code (BaseEntity requirement).

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

SELECT public.backfill_entity_code('public.payment_period'::regclass);
SELECT public.backfill_entity_code('public.payment_batch'::regclass);
SELECT public.backfill_entity_code('public.payment_slip'::regclass);

DO $backfill_tenant_payment_codes$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_name IN ('payment_period', 'payment_batch', 'payment_slip')
          AND table_schema NOT IN ('public', 'admin', 'pg_catalog', 'information_schema')
    LOOP
        EXECUTE format(
            'SELECT public.backfill_entity_code(%L::regclass)',
            r.table_schema || '.' || r.table_name);
    END LOOP;
END;
$backfill_tenant_payment_codes$;

DROP FUNCTION public.backfill_entity_code(regclass);

COMMENT ON COLUMN public.payment_period.code IS 'Sequential integer code for payment period';
COMMENT ON COLUMN public.payment_batch.code IS 'Sequential integer code for payment batch';
COMMENT ON COLUMN public.payment_slip.code IS 'Sequential integer code for payment slip';
