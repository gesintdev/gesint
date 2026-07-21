-- Sincroniza colunas de auditoria de revisao de ferias (V58) em tenants existentes.
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
                ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS reviewed_by UUID',
            tenant_schema
        );

        EXECUTE format(
            'UPDATE %I.leave_request
             SET reviewed_by = updated_by,
                 reviewed_at = COALESCE(updated_at, created_at)
             WHERE reviewed_by IS NULL
               AND (
                    approved = TRUE
                    OR review_status IN (''APPROVED'', ''RETURNED'', ''REJECTED'')
                   )
               AND updated_by IS NOT NULL',
            tenant_schema
        );
    END LOOP;
END $$;
