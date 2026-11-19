ALTER TABLE public.app_user
    ADD COLUMN IF NOT EXISTS assistant_open_mode VARCHAR(20) NOT NULL DEFAULT 'SIDE';

ALTER TABLE public.app_user
    DROP CONSTRAINT IF EXISTS chk_app_user_assistant_open_mode;

ALTER TABLE public.app_user
    ADD CONSTRAINT chk_app_user_assistant_open_mode
        CHECK (assistant_open_mode IN ('SIDE', 'MODAL', 'TAB'));

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
            'ALTER TABLE %I.app_user ADD COLUMN IF NOT EXISTS assistant_open_mode VARCHAR(20) NOT NULL DEFAULT ''SIDE''',
            tenant_schema
        );
        EXECUTE format(
            'ALTER TABLE %I.app_user DROP CONSTRAINT IF EXISTS chk_app_user_assistant_open_mode',
            tenant_schema
        );
        EXECUTE format(
            'ALTER TABLE %I.app_user ADD CONSTRAINT chk_app_user_assistant_open_mode CHECK (assistant_open_mode IN (''SIDE'', ''MODAL'', ''TAB''))',
            tenant_schema
        );
    END LOOP;
END
$$;

SELECT public.gesint_audit_sync_table('app_user');
