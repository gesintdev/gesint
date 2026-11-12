ALTER TABLE public.app_user
    ADD COLUMN IF NOT EXISTS report_pdf_delivery_mode VARCHAR(20) NOT NULL DEFAULT 'DOWNLOAD';

ALTER TABLE public.app_user
    DROP CONSTRAINT IF EXISTS chk_app_user_report_pdf_delivery_mode;

ALTER TABLE public.app_user
    ADD CONSTRAINT chk_app_user_report_pdf_delivery_mode
        CHECK (report_pdf_delivery_mode IN ('DOWNLOAD', 'NEW_TAB'));

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.app_user', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.app_user ADD COLUMN IF NOT EXISTS report_pdf_delivery_mode VARCHAR(20) NOT NULL DEFAULT ''DOWNLOAD''',
            tenant_schema
        );
    END LOOP;
END
$$;

SELECT public.gesint_audit_sync_table('app_user');
