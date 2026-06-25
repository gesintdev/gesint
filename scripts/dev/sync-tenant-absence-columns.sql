-- Sincroniza colunas de afastamento/ponto adicionadas na migration V43 em tenants existentes.
-- Executar apos aplicar Flyway no schema public.

DO $$
DECLARE
    tenant_schema text;
BEGIN
    FOR tenant_schema IN
        SELECT nspname
        FROM pg_namespace
        WHERE nspname LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.leave_request
                ADD COLUMN IF NOT EXISTS absence_status public.leave_absence_status_enum,
                ADD COLUMN IF NOT EXISTS duration_days INT,
                ADD COLUMN IF NOT EXISTS cid VARCHAR(20),
                ADD COLUMN IF NOT EXISTS physician_name VARCHAR(180),
                ADD COLUMN IF NOT EXISTS physician_crm VARCHAR(40),
                ADD COLUMN IF NOT EXISTS certificate_source VARCHAR(80),
                ADD COLUMN IF NOT EXISTS requires_inss BOOLEAN NOT NULL DEFAULT false,
                ADD COLUMN IF NOT EXISTS inss_referral_date DATE,
                ADD COLUMN IF NOT EXISTS return_date DATE,
                ADD COLUMN IF NOT EXISTS work_accident_stability BOOLEAN NOT NULL DEFAULT false,
                ADD COLUMN IF NOT EXISTS related_certificate_days INT',
            tenant_schema
        );

        EXECUTE format(
            'UPDATE %I.leave_request
             SET absence_status = CASE
                    WHEN leave_type = ''VACATION'' THEN NULL
                    WHEN approved = TRUE THEN ''VALIDATED''::public.leave_absence_status_enum
                    ELSE ''PENDING''::public.leave_absence_status_enum
                 END,
                 duration_days = (end_date - start_date + 1),
                 requires_inss = CASE
                    WHEN leave_type <> ''VACATION'' AND (end_date - start_date + 1) > 15 THEN TRUE
                    ELSE requires_inss
                 END
             WHERE status != ''DELETED''',
            tenant_schema
        );

        EXECUTE format(
            'ALTER TABLE %I.attendance_record
                ADD COLUMN IF NOT EXISTS occurrence_type public.attendance_occurrence_type_enum NOT NULL DEFAULT ''NORMAL_WORK'',
                ADD COLUMN IF NOT EXISTS occurrence_origin public.attendance_occurrence_origin_enum NOT NULL DEFAULT ''MANUAL'',
                ADD COLUMN IF NOT EXISTS reference_id UUID,
                ADD COLUMN IF NOT EXISTS expected_hours NUMERIC(5, 2),
                ADD COLUMN IF NOT EXISTS worked_hours NUMERIC(5, 2),
                ADD COLUMN IF NOT EXISTS impacts_hour_bank BOOLEAN NOT NULL DEFAULT true,
                ADD COLUMN IF NOT EXISTS impacts_payroll BOOLEAN NOT NULL DEFAULT true',
            tenant_schema
        );
    END LOOP;
END $$;
