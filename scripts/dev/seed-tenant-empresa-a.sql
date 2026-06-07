-- Seed dev: Empresa A (multi-tenant Etapas 2-3)
--
-- Pre-requisitos:
--   - Cliente "Empresa A" ja cadastrado no Gommo Admin (slug empresa-a)
--   - Postgres local (docker compose) com schemas admin + public migrados
--   - Usuario HR admin@gommo.local (criado pelo DevAdminInitializer, senha DEV_ADMIN_PASSWORD)
--
-- Apos rodar, configure no .env da raiz:
--   GOMMO_MULTI_TENANT_ENABLED=true
--   GOMMO_DEV_TENANT_SLUG=empresa-a
--   GOMMO_TENANT_HEADER_ENABLED=true
--   GOMMO_TENANT_BASE_DOMAIN=localhost
--
-- Teste:
--   URL:  http://empresa-a.localhost:3000
--   Login: admin / (DEV_ADMIN_PASSWORD)  (ou valor de DEV_ADMIN_PASSWORD)
--
-- Executar (PowerShell na raiz do repo):
--   .\scripts\dev\run-seed-tenant-empresa-a.ps1
--
-- Ou via docker:
--   Get-Content scripts/dev/seed-tenant-empresa-a.sql -Raw |
--     docker exec -i -e PGPASSWORD=${POSTGRES_PASSWORD} gommo-postgres psql -v ON_ERROR_STOP=1 -U gommo -d gommo

BEGIN;

-- Constantes (ajuste se seus IDs forem diferentes)
-- SELECT id FROM admin.client WHERE slug = 'empresa-a';
-- SELECT id FROM public.app_user WHERE username = 'admin';

DO $seed$
DECLARE
    v_client_id    constant uuid := 'a19284f2-f3a5-4435-8670-4a616c0ee3f7';
    v_admin_user   constant uuid := '16689a81-93ee-49b5-89e2-6f9d5a1264a0';
    v_schema       constant text := 'tenant_empresa_a';
    v_slug         constant text := 'empresa-a';
    v_cnpj         constant text := '11222333000181';
    tbl            text;
    tenant_tables  constant text[] := ARRAY[
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
        'offboarding',
        'exit_interview',
        'performance_review',
        'payroll_run',
        'payroll_event',
        'payslip',
        'payslip_entry',
        'storage_object',
        'storage_object_link',
        'tax_obligation',
        'audit_log'
    ];
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin.client WHERE id = v_client_id AND status <> 'DELETED') THEN
        RAISE EXCEPTION 'Cliente Empresa A nao encontrado (id %). Cadastre no admin ou ajuste v_client_id.', v_client_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.app_user WHERE id = v_admin_user AND status <> 'DELETED') THEN
        RAISE EXCEPTION 'Usuario admin HR nao encontrado (id %). Suba gommo-backend com DEV_ADMIN_PASSWORD.', v_admin_user;
    END IF;

    -- 1. Control plane: metadados do tenant
    UPDATE admin.client
    SET
        document            = v_cnpj,
        subdomain           = v_slug,
        routing_mode        = 'SUBDOMAIN',
        database_strategy   = 'DEDICATED_SCHEMA',
        database_host       = 'localhost',
        database_port       = 5432,
        database_name       = 'gommo',
        database_schema     = v_schema,
        database_user       = 'gommo',
        database_secret_ref = 'DB_PASSWORD',
        provisioning_status = 'READY',
        updated_at          = now()
    WHERE id = v_client_id;

    -- 2. Assinatura ativa
    INSERT INTO admin.client_subscription (
        status,
        client_id,
        plan_code,
        billing_status,
        started_at,
        monthly_amount,
        notes,
        code
    )
    SELECT
        'ACTIVE',
        v_client_id,
        'STARTER',
        'ACTIVE',
        now(),
        0.00,
        'Seed dev multi-tenant',
        COALESCE((SELECT MAX(code) FROM admin.client_subscription), 0) + 1
    WHERE NOT EXISTS (
        SELECT 1
        FROM admin.client_subscription
        WHERE client_id = v_client_id
          AND status <> 'DELETED'
          AND billing_status = 'ACTIVE'
    );

    -- 3. Vinculo admin.client_user
    INSERT INTO admin.client_user (
        status,
        client_id,
        app_user_id,
        display_name,
        code
    )
    SELECT
        'ACTIVE',
        v_client_id,
        v_admin_user,
        'Admin Empresa A',
        COALESCE((SELECT MAX(code) FROM admin.client_user), 0) + 1
    WHERE NOT EXISTS (
        SELECT 1
        FROM admin.client_user
        WHERE app_user_id = v_admin_user
          AND status <> 'DELETED'
    );

    -- 4. Schema dedicado + tabelas HR
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema);

    FOREACH tbl IN ARRAY tenant_tables LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = v_schema
              AND table_name = tbl
        ) THEN
            EXECUTE format(
                'CREATE TABLE %I.%I (LIKE public.%I INCLUDING ALL)',
                v_schema,
                tbl,
                tbl
            );
            RAISE NOTICE 'Criada tabela %.%', v_schema, tbl;
        END IF;
    END LOOP;

    -- 5. Empresa empregadora no tenant
    INSERT INTO tenant_empresa_a.company (
        id,
        status,
        legal_name,
        trade_name,
        cnpj,
        email,
        city,
        state_code,
        code
    )
    SELECT
        'aaaaaaaa-0001-4000-8000-000000000001'::uuid,
        'ACTIVE',
        'Empresa A Ltda',
        'Empresa A',
        v_cnpj,
        'contato@empresa-a.local',
        'Sao Paulo',
        'SP',
        1
    WHERE NOT EXISTS (
        SELECT 1 FROM tenant_empresa_a.company WHERE cnpj = v_cnpj
    );
END;
$seed$;

COMMIT;

-- Verificacao
SELECT 'client' AS check, slug, subdomain, database_schema, provisioning_status, document
FROM admin.client
WHERE slug = 'empresa-a';

SELECT 'subscription' AS check, plan_code, billing_status, status
FROM admin.client_subscription
WHERE client_id = 'a19284f2-f3a5-4435-8670-4a616c0ee3f7'::uuid
  AND status <> 'DELETED';

SELECT 'client_user' AS check, cu.display_name, u.username, u.email
FROM admin.client_user cu
JOIN public.app_user u ON u.id = cu.app_user_id
WHERE cu.client_id = 'a19284f2-f3a5-4435-8670-4a616c0ee3f7'::uuid
  AND cu.status <> 'DELETED';

SELECT 'tenant_company' AS check, legal_name, trade_name, cnpj, city
FROM tenant_empresa_a.company
WHERE status <> 'DELETED';
