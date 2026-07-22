-- Seed dev: Empresa A (multi-tenant) — somente infraestrutura + usuarios ja cadastrados no admin.
--
-- NAO copia o admin global de public.app_user. Apenas admin.client_user do cliente sao
-- provisionados no schema tenant_empresa_a.
--
-- Pre-requisitos:
--   - Cliente "Empresa A" cadastrado no Gommo Admin (slug empresa-a)
--   - Usuario(s) da empresa cadastrados em admin.client_user para esse cliente
--   - Postgres local com migrations admin V5+ e public migrado
--
-- Executar (na raiz do repo):
--   .\scripts\dev\run-seed-tenant-empresa-a.ps1

BEGIN;

DO $seed$
DECLARE
    v_client_id   constant uuid := 'a19284f2-f3a5-4435-8670-4a616c0ee3f7';
    v_schema      constant text := 'tenant_empresa_a';
    v_slug        constant text := 'empresa-a';
    v_cnpj        constant text := '11222333000181';
    v_admin_role  constant uuid := '00000000-0000-0000-0000-000000000001';
    tbl           text;
    tenant_tables constant text[] := ARRAY[
        'company',
        'department',
        'job_position',
        'collaborator',
        'collaborator_address',
        'collaborator_contact',
        'employment_contract',
        'contract_recess_policy',
        'contract_recess_period',
        'admission_process',
        'admission_process_kanban_column',
        'attendance_record',
        'benefit_plan',
        'benefit_enrollment',
        'leave_request',
        'system_setting',
        'system_notification',
        'agenda_event',
        'offboarding',
        'exit_interview',
        'exit_interview_return_checklist_item',
        'performance_review',
        'job_vacancy',
        'candidate',
        'job_vacancy_application',
        'competency',        'proficiency_level',
        'development_track',
        'development_track_competency',
        'development_action_template',
        'evidence_type',
        'development_plan_origin',
        'development_plan',
        'development_plan_competency',
        'development_plan_goal',
        'development_plan_action',
        'development_plan_checkin',
        'development_plan_evidence',
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
    IF NOT EXISTS (SELECT 1 FROM admin.client WHERE id = v_client_id AND status <> 'DELETED') THEN
        RAISE EXCEPTION 'Cliente Empresa A nao encontrado (id %). Cadastre no admin ou ajuste v_client_id.', v_client_id;
    END IF;

    -- 1. Metadados do tenant no control plane
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

    -- 2. Assinatura ativa (dev)
    INSERT INTO admin.client_subscription (
        status, client_id, plan_code, billing_status, started_at, monthly_amount, notes, code
    )
    SELECT
        'ACTIVE', v_client_id, 'STARTER', 'ACTIVE', now(), 0.00, 'Seed dev multi-tenant',
        COALESCE((SELECT MAX(code) FROM admin.client_subscription), 0) + 1
    WHERE NOT EXISTS (
        SELECT 1 FROM admin.client_subscription
        WHERE client_id = v_client_id AND status <> 'DELETED' AND billing_status = 'ACTIVE'
    );

    -- 3. Schema + tabelas HR
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema);

    FOREACH tbl IN ARRAY tenant_tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = v_schema AND table_name = tbl
        ) THEN
            EXECUTE format(
                'CREATE TABLE %I.%I (LIKE public.%I INCLUDING ALL)',
                v_schema, tbl, tbl
            );
        END IF;
    END LOOP;

    -- 4. Tabelas de auth no tenant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = v_schema AND table_name = 'app_user'
    ) THEN
        EXECUTE format($sql$
            CREATE TABLE %I.app_user (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                status public.status_enum NOT NULL DEFAULT 'ACTIVE',
                collaborator_id UUID,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(200) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                last_login TIMESTAMPTZ,
                must_change_pwd BOOLEAN DEFAULT false,
                created_by UUID,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_by UUID,
                updated_at TIMESTAMPTZ,
                code INTEGER NOT NULL
            )
        $sql$, v_schema);
        EXECUTE format(
            'CREATE UNIQUE INDEX idx_%s_app_user_username ON %I.app_user (username) WHERE status != ''DELETED''',
            v_schema, v_schema);
        EXECUTE format(
            'CREATE UNIQUE INDEX idx_%s_app_user_email ON %I.app_user (email) WHERE status != ''DELETED''',
            v_schema, v_schema);
        EXECUTE format('CREATE UNIQUE INDEX uk_%s_app_user_code ON %I.app_user (code)', v_schema, v_schema);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema AND table_name = 'permission'
    ) THEN
        EXECUTE format($sql$
            CREATE TABLE %I.permission (
                id UUID PRIMARY KEY, code INTEGER NOT NULL, authority VARCHAR(100) NOT NULL,
                module VARCHAR(50) NOT NULL, description TEXT
            )
        $sql$, v_schema);
        EXECUTE format('CREATE UNIQUE INDEX uk_%s_permission_code ON %I.permission (code)', v_schema, v_schema);
        EXECUTE format('CREATE UNIQUE INDEX uk_%s_permission_authority ON %I.permission (authority)', v_schema, v_schema);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema AND table_name = 'role'
    ) THEN
        EXECUTE format($sql$
            CREATE TABLE %I.role (
                id UUID PRIMARY KEY, code INTEGER NOT NULL, name VARCHAR(50) NOT NULL, description TEXT,
                system public.system_scope_enum NOT NULL DEFAULT 'RH',
                status public.status_enum NOT NULL DEFAULT 'ACTIVE',
                is_system BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ
            )
        $sql$, v_schema);
        EXECUTE format('CREATE UNIQUE INDEX uk_%s_role_code ON %I.role (code)', v_schema, v_schema);
        EXECUTE format('CREATE UNIQUE INDEX uk_%s_role_name ON %I.role (name)', v_schema, v_schema);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema AND table_name = 'role_permission'
    ) THEN
        EXECUTE format($sql$
            CREATE TABLE %I.role_permission (
                role_id UUID NOT NULL REFERENCES %I.role(id),
                permission_id UUID NOT NULL REFERENCES %I.permission(id),
                PRIMARY KEY (role_id, permission_id)
            )
        $sql$, v_schema, v_schema, v_schema);
    END IF;

    INSERT INTO tenant_empresa_a.permission (id, code, authority, module, description)
    SELECT p.id, p.code, p.authority, p.module, p.description FROM public.permission p
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO tenant_empresa_a.role (id, code, name, description, system, status, is_system, created_at, updated_at)
    SELECT r.id, r.code, r.name, r.description, r.system, r.status, r.is_system, r.created_at, r.updated_at
    FROM public.role r WHERE r.is_system = true
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO tenant_empresa_a.role_permission (role_id, permission_id)
    SELECT rp.role_id, rp.permission_id
    FROM public.role_permission rp
    INNER JOIN public.role r ON r.id = rp.role_id AND r.is_system = true
    ON CONFLICT DO NOTHING;

    INSERT INTO tenant_empresa_a.role_permission (role_id, permission_id)
    SELECT v_admin_role, p.id FROM tenant_empresa_a.permission p
    ON CONFLICT DO NOTHING;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema AND table_name = 'user_role'
    ) THEN
        EXECUTE format($sql$
            CREATE TABLE %I.user_role (
                user_id UUID NOT NULL REFERENCES %I.app_user(id),
                role_id UUID NOT NULL REFERENCES %I.role(id),
                PRIMARY KEY (user_id, role_id)
            )
        $sql$, v_schema, v_schema, v_schema);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema AND table_name = 'refresh_token'
    ) THEN
        EXECUTE format($sql$
            CREATE TABLE %I.refresh_token (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES %I.app_user(id),
                token_hash VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMPTZ NOT NULL,
                revoked BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                code INTEGER NOT NULL
            )
        $sql$, v_schema, v_schema);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = v_schema AND table_name = 'refresh_token_blacklist'
    ) THEN
        EXECUTE format($sql$
            CREATE TABLE %I.refresh_token_blacklist (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                token_hash VARCHAR(255) NOT NULL UNIQUE,
                revoked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                code INTEGER NOT NULL
            )
        $sql$, v_schema);
    END IF;

    -- 5. Provisiona SOMENTE admin.client_user deste cliente (nunca public.app_user)
    INSERT INTO tenant_empresa_a.app_user (
        id, status, username, email, password_hash, must_change_pwd, code, created_at, updated_at
    )
    SELECT
        gen_random_uuid(),
        'ACTIVE',
        cu.username,
        cu.email,
        cu.password_hash,
        true,
        COALESCE((SELECT MAX(code) FROM tenant_empresa_a.app_user), 0)
            + ROW_NUMBER() OVER (ORDER BY cu.username),
        now(),
        now()
    FROM admin.client_user cu
    WHERE cu.client_id = v_client_id
      AND cu.status <> 'DELETED'
      AND cu.password_hash IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM tenant_empresa_a.app_user t
          WHERE LOWER(t.username) = LOWER(cu.username) AND t.status <> 'DELETED'
      );

    INSERT INTO tenant_empresa_a.user_role (user_id, role_id)
    SELECT t.id, v_admin_role
    FROM tenant_empresa_a.app_user t
    JOIN admin.client_user cu
        ON cu.client_id = v_client_id
       AND cu.status <> 'DELETED'
       AND LOWER(cu.username) = LOWER(t.username)
    WHERE t.status <> 'DELETED'
      AND NOT EXISTS (
          SELECT 1 FROM tenant_empresa_a.user_role ur
          WHERE ur.user_id = t.id AND ur.role_id = v_admin_role
      );

    UPDATE admin.client_user cu
    SET
        tenant_app_user_id = t.id,
        provisioned_at = COALESCE(cu.provisioned_at, now()),
        updated_at = now()
    FROM tenant_empresa_a.app_user t
    WHERE cu.client_id = v_client_id
      AND cu.status <> 'DELETED'
      AND LOWER(cu.username) = LOWER(t.username)
      AND t.status <> 'DELETED'
      AND (cu.tenant_app_user_id IS NULL OR cu.tenant_app_user_id <> t.id);

    -- 6. Empresa empregadora de exemplo (opcional dev)
    INSERT INTO tenant_empresa_a.company (
        id, status, legal_name, trade_name, cnpj, email, city, state_code, code
    )
    SELECT
        'aaaaaaaa-0001-4000-8000-000000000001'::uuid,
        'ACTIVE', 'Empresa A Ltda', 'Empresa A', v_cnpj,
        'contato@empresa-a.local', 'Sao Paulo', 'SP', 1
    WHERE NOT EXISTS (
        SELECT 1 FROM tenant_empresa_a.company WHERE cnpj = v_cnpj
    );

    -- 7. Eventos padrão de folha (isolados no schema do tenant)
    INSERT INTO tenant_empresa_a.payroll_event (
        id, status, event_code, description, event_type,
        incides_inss, incides_fgts, incides_irrf, formula, code, created_at
    )
    SELECT
        p.id, p.status, p.event_code, p.description, p.event_type,
        p.incides_inss, p.incides_fgts, p.incides_irrf, p.formula, p.code, now()
    FROM public.payroll_event p
    WHERE p.status <> 'DELETED'
    ON CONFLICT (id) DO NOTHING;

    -- 8. Checklist padrao da entrevista de desligamento (isolado no schema do tenant)
    INSERT INTO tenant_empresa_a.exit_interview_return_checklist_item (
        id, status, item_key, description, display_order, code, created_at
    )
    SELECT
        p.id, p.status, p.item_key, p.description, p.display_order, p.code, now()
    FROM public.exit_interview_return_checklist_item p
    WHERE p.status <> 'DELETED'
      AND NOT EXISTS (
          SELECT 1
          FROM tenant_empresa_a.exit_interview_return_checklist_item t
          WHERE LOWER(t.item_key) = LOWER(p.item_key)
            AND t.status <> 'DELETED'
      )
    ON CONFLICT (id) DO NOTHING;

    -- 9. Colunas padrao do kanban de processo de admissao
    INSERT INTO tenant_empresa_a.admission_process_kanban_column (
        id, status, column_key, name, color, display_order, code, created_at
    )
    SELECT
        p.id, p.status, p.column_key, p.name, p.color, p.display_order, p.code, now()
    FROM public.admission_process_kanban_column p
    WHERE p.status <> 'DELETED'
      AND NOT EXISTS (
          SELECT 1
          FROM tenant_empresa_a.admission_process_kanban_column t
          WHERE LOWER(t.column_key) = LOWER(p.column_key)
            AND t.status <> 'DELETED'
      )
    ON CONFLICT (id) DO NOTHING;
END;
$seed$;

COMMIT;

SELECT 'client' AS check, slug, provisioning_status, database_schema FROM admin.client WHERE slug = 'empresa-a';

SELECT 'client_user' AS check, username, email, tenant_app_user_id, provisioned_at
FROM admin.client_user
WHERE client_id = 'a19284f2-f3a5-4435-8670-4a616c0ee3f7'::uuid AND status <> 'DELETED';

SELECT 'tenant_user' AS check, username, email FROM tenant_empresa_a.app_user WHERE status <> 'DELETED';
