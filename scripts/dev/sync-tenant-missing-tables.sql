-- Sync missing HR tables into all dedicated tenant schemas.
-- Run after adding new Flyway migrations in gommo-backend (public template tables).
--
-- Usage (repo root):
--   docker compose exec -T postgres psql -U gommo -d gommo -f /scripts/dev/sync-tenant-missing-tables.sql
--   (mount scripts or pipe: Get-Content scripts/dev/sync-tenant-missing-tables.sql | docker compose exec -T postgres psql -U gommo -d gommo)

BEGIN;

DO $sync$
DECLARE
    tenant_record record;
    tbl text;
    tenant_tables constant text[] := ARRAY[
        'company',
        'department',
        'job_position',
        'collaborator',
        'collaborator_address',
        'collaborator_contact',
        'employment_contract',
        'admission_process',
        'attendance_record',
        'benefit_plan',
        'benefit_enrollment',
        'leave_request',
        'system_setting',
        'system_notification',
        'offboarding',
        'exit_interview',
        'exit_interview_return_checklist_item',
        'performance_review',
        'payroll_run',
        'payroll_event',
        'payslip',
        'payslip_entry',
        'payment_period',
        'payment_batch',
        'payment_slip',
        'storage_object',
        'storage_object_link',
        'tax_obligation',
        'audit_log'
    ];
BEGIN
    FOR tenant_record IN
        SELECT database_schema AS schema_name
        FROM admin.client
        WHERE status <> 'DELETED'
          AND database_strategy = 'DEDICATED_SCHEMA'
          AND database_schema IS NOT NULL
          AND database_schema <> 'public'
          AND provisioning_status = 'READY'
    LOOP
        EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', tenant_record.schema_name);

        FOREACH tbl IN ARRAY tenant_tables LOOP
            IF EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = tbl
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = tenant_record.schema_name AND table_name = tbl
            ) THEN
                EXECUTE format(
                    'CREATE TABLE %I.%I (LIKE public.%I INCLUDING ALL)',
                    tenant_record.schema_name, tbl, tbl
                );
                RAISE NOTICE 'Created %.%', tenant_record.schema_name, tbl;
            END IF;
        END LOOP;

        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = tenant_record.schema_name
              AND table_name = 'exit_interview_return_checklist_item'
        ) THEN
            EXECUTE format($sql$
                INSERT INTO %I.exit_interview_return_checklist_item (
                    id, status, item_key, description, display_order, code, created_at
                )
                SELECT p.id, p.status, p.item_key, p.description, p.display_order, p.code, now()
                FROM public.exit_interview_return_checklist_item p
                WHERE p.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM %I.exit_interview_return_checklist_item t
                      WHERE LOWER(t.item_key) = LOWER(p.item_key)
                        AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
            $sql$, tenant_record.schema_name, tenant_record.schema_name);
        END IF;
    END LOOP;
END
$sync$;

COMMIT;
