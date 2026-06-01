-- Código sequencial inteiro (identificador amigável) em todas as tabelas de entidade.
-- permission.code (varchar RBAC) renomeado para authority antes de adicionar code integer.

ALTER TABLE permission RENAME COLUMN code TO authority;

CREATE OR REPLACE FUNCTION public.backfill_entity_code(p_table regclass)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_table text := p_table::text;
BEGIN
    EXECUTE format('ALTER TABLE %s ADD COLUMN IF NOT EXISTS code INTEGER', p_table);
    EXECUTE format(
        'UPDATE %s t SET code = s.rn FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM %s
        ) s WHERE t.id = s.id AND t.code IS NULL',
        p_table,
        p_table);
    EXECUTE format('ALTER TABLE %s ALTER COLUMN code SET NOT NULL', p_table);
    EXECUTE format(
        'CREATE UNIQUE INDEX IF NOT EXISTS %I ON %s (code)',
        'uk_' || replace(replace(v_table, 'public.', ''), '.', '_') || '_code',
        p_table);
END;
$$;

SELECT public.backfill_entity_code('public.collaborator'::regclass);
SELECT public.backfill_entity_code('public.app_user'::regclass);
SELECT public.backfill_entity_code('public.role'::regclass);
SELECT public.backfill_entity_code('public.permission'::regclass);
SELECT public.backfill_entity_code('public.refresh_token'::regclass);
SELECT public.backfill_entity_code('public.refresh_token_blacklist'::regclass);
SELECT public.backfill_entity_code('public.storage_object'::regclass);
SELECT public.backfill_entity_code('public.storage_object_link'::regclass);
SELECT public.backfill_entity_code('public.company'::regclass);
SELECT public.backfill_entity_code('public.department'::regclass);
SELECT public.backfill_entity_code('public.job_position'::regclass);
SELECT public.backfill_entity_code('public.employment_contract'::regclass);
SELECT public.backfill_entity_code('public.attendance_record'::regclass);
SELECT public.backfill_entity_code('public.leave_request'::regclass);
SELECT public.backfill_entity_code('public.payroll_run'::regclass);
SELECT public.backfill_entity_code('public.payslip'::regclass);
SELECT public.backfill_entity_code('public.benefit_plan'::regclass);
SELECT public.backfill_entity_code('public.admission_process'::regclass);
SELECT public.backfill_entity_code('public.offboarding'::regclass);
SELECT public.backfill_entity_code('public.exit_interview'::regclass);
SELECT public.backfill_entity_code('public.collaborator_address'::regclass);
SELECT public.backfill_entity_code('public.collaborator_contact'::regclass);
SELECT public.backfill_entity_code('public.benefit_enrollment'::regclass);
SELECT public.backfill_entity_code('public.tax_obligation'::regclass);
SELECT public.backfill_entity_code('public.performance_review'::regclass);

DROP FUNCTION public.backfill_entity_code(regclass);

COMMENT ON COLUMN public.permission.authority IS 'Chave RBAC (ex.: department:read)';
COMMENT ON COLUMN public.permission.code IS 'Código sequencial inteiro da permissão';
