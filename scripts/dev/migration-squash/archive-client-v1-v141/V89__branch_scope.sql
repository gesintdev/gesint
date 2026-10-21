-- Suporte a filiais (estabelecimentos).
--
-- Filial e a propria company: no Brasil filial e estabelecimento com CNPJ proprio, e folha,
-- AFD do ponto, eSocial e FGTS sao todos por estabelecimento. A hierarquia matriz -> filiais
-- e representada por company.parent_id.
--
-- Esta migration roda no schema public (template do data plane). Tenants ja provisionados
-- recebem estas colunas via TenantSchemaStructureSynchronizer no gesint-admin-backend, e o
-- backfill de dados via TenantBranchBackfiller.

-- 1. Hierarquia matriz/filial -------------------------------------------------------------

ALTER TABLE company
    ADD COLUMN IF NOT EXISTS parent_id       UUID REFERENCES company (id),
    ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS sort_order      INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_company_parent ON company (parent_id);

-- Uma unica matriz por schema (tenant).
CREATE UNIQUE INDEX IF NOT EXISTS uk_company_headquarters
    ON company (is_headquarters)
    WHERE is_headquarters AND status <> 'DELETED';

-- A empresa mais antiga vira a matriz; as demais ja cadastradas passam a ser filiais dela.
UPDATE company
   SET is_headquarters = true
 WHERE id = (
        SELECT id FROM company WHERE status <> 'DELETED' ORDER BY created_at, code LIMIT 1
      )
   AND NOT EXISTS (SELECT 1 FROM company WHERE is_headquarters AND status <> 'DELETED');

UPDATE company
   SET parent_id = (SELECT id FROM company WHERE is_headquarters AND status <> 'DELETED' LIMIT 1)
 WHERE NOT is_headquarters
   AND parent_id IS NULL
   AND status <> 'DELETED';

-- 2. Coluna de escopo nas entidades operacionais -------------------------------------------

DO $$
DECLARE
    scoped_table TEXT;
    scoped_tables TEXT[] := ARRAY[
        'collaborator', 'collaborator_address', 'collaborator_contact',
        'contract_recess_policy', 'contract_recess_period',
        'admission_step', 'esocial_event',
        'attendance_record', 'attendance_request',
        'benefit_enrollment', 'leave_request',
        'occupational_exam', 'complementary_exam', 'esocial_health_event',
        'digital_certificate', 'system_notification', 'agenda_event',
        'offboarding', 'exit_interview', 'performance_review',
        'job_vacancy', 'candidate', 'job_vacancy_application',
        'development_plan', 'development_plan_competency', 'development_plan_goal',
        'development_plan_action', 'development_plan_checkin', 'development_plan_evidence',
        'payroll_run', 'payslip', 'payslip_entry',
        'payment_period', 'payment_batch', 'payment_slip',
        'storage_object', 'storage_object_link',
        'search_document', 'audit_log', 'tax_obligation'
    ];
BEGIN
    FOREACH scoped_table IN ARRAY scoped_tables LOOP
        IF to_regclass(scoped_table) IS NULL THEN
            CONTINUE;
        END IF;
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS company_id UUID', scoped_table);
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON %I (company_id)',
            'idx_' || scoped_table || '_company',
            scoped_table);
    END LOOP;
END $$;

-- 3. Backfill: tudo que ja existe pertence a matriz ----------------------------------------

DO $$
DECLARE
    scoped_table TEXT;
    headquarters UUID;
BEGIN
    SELECT id INTO headquarters FROM company WHERE is_headquarters AND status <> 'DELETED' LIMIT 1;
    IF headquarters IS NULL THEN
        RETURN;
    END IF;

    FOR scoped_table IN
        SELECT c.table_name
          FROM information_schema.columns c
         WHERE c.table_schema = current_schema()
           AND c.column_name = 'company_id'
           AND c.table_name <> 'company'
    LOOP
        EXECUTE format('UPDATE %I SET company_id = $1 WHERE company_id IS NULL', scoped_table)
            USING headquarters;
    END LOOP;
END $$;

-- 4. Perfis por filial ---------------------------------------------------------------------
-- O mesmo usuario pode ter perfis diferentes em cada filial, entao a filial entra na PK.

ALTER TABLE user_role ADD COLUMN IF NOT EXISTS company_id UUID;

UPDATE user_role
   SET company_id = (SELECT id FROM company WHERE is_headquarters AND status <> 'DELETED' LIMIT 1)
 WHERE company_id IS NULL;

DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count FROM user_role WHERE company_id IS NULL;
    IF orphan_count > 0 THEN
        -- Sem matriz cadastrada nao ha como escopar os vinculos; deixa nullable para o
        -- backfill do provisionamento resolver depois.
        RETURN;
    END IF;

    ALTER TABLE user_role ALTER COLUMN company_id SET NOT NULL;
    ALTER TABLE user_role DROP CONSTRAINT IF EXISTS user_role_pkey;
    ALTER TABLE user_role ADD PRIMARY KEY (user_id, role_id, company_id);
END $$;

CREATE INDEX IF NOT EXISTS idx_user_role_company ON user_role (company_id);
