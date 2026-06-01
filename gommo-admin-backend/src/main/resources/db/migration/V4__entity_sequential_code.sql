-- Código sequencial inteiro nas tabelas do schema admin.

CREATE OR REPLACE FUNCTION admin.backfill_entity_code(p_table regclass)
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
        'uk_' || replace(replace(v_table, 'admin.', ''), '.', '_') || '_code',
        p_table);
END;
$$;

SELECT admin.backfill_entity_code('admin.admin_user'::regclass);
SELECT admin.backfill_entity_code('admin.client'::regclass);
SELECT admin.backfill_entity_code('admin.client_user'::regclass);
SELECT admin.backfill_entity_code('admin.client_subscription'::regclass);
SELECT admin.backfill_entity_code('admin.client_payment'::regclass);
SELECT admin.backfill_entity_code('admin.refresh_token'::regclass);
SELECT admin.backfill_entity_code('admin.refresh_token_blacklist'::regclass);

DROP FUNCTION admin.backfill_entity_code(regclass);

-- Tabelas public compartilhadas com gommo-backend (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'app_user' AND column_name = 'code'
    ) THEN
        ALTER TABLE public.app_user ADD COLUMN code INTEGER;
        UPDATE public.app_user t SET code = s.rn FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.app_user
        ) s WHERE t.id = s.id;
        ALTER TABLE public.app_user ALTER COLUMN code SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uk_app_user_code ON public.app_user (code);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'permission'
          AND column_name = 'code' AND data_type = 'character varying'
    ) THEN
        ALTER TABLE public.permission RENAME COLUMN code TO authority;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'permission' AND column_name = 'code'
    ) THEN
        ALTER TABLE public.permission ADD COLUMN code INTEGER;
        UPDATE public.permission t SET code = s.rn FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.permission
        ) s WHERE t.id = s.id;
        ALTER TABLE public.permission ALTER COLUMN code SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uk_permission_code ON public.permission (code);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'role' AND column_name = 'code'
    ) THEN
        ALTER TABLE public.role ADD COLUMN code INTEGER;
        UPDATE public.role t SET code = s.rn FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.role
        ) s WHERE t.id = s.id;
        ALTER TABLE public.role ALTER COLUMN code SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uk_role_code ON public.role (code);
    END IF;
END $$;
