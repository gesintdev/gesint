-- RN-30: requisicao de vaga (aumento de quadro ou substituicao vinda do desligamento),
-- salario confrontado com a faixa do cargo/nivel e alcada gestor -> RH -> diretoria (fora da faixa).

CREATE TABLE IF NOT EXISTS job_requisition (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL,
    status                      gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id                  UUID,
    job_position_id             UUID NOT NULL REFERENCES job_position (id),
    job_position_title          VARCHAR(200),
    salary_level                gommo_types.job_position_salary_level_enum,
    contract_type               VARCHAR(32),
    experience_period           VARCHAR(32),
    positions_count             INTEGER NOT NULL DEFAULT 1,
    desired_start_date          DATE,
    reason                      VARCHAR(32) NOT NULL,
    offboarding_id              UUID,
    replaced_collaborator_id    UUID,
    replaced_collaborator_name  VARCHAR(200),
    replaced_dismissal_date     DATE,
    replaced_dismissal_type     VARCHAR(32),
    proposed_salary             NUMERIC(14, 2),
    band_min_salary             NUMERIC(14, 2),
    band_reference_salary       NUMERIC(14, 2),
    band_max_salary             NUMERIC(14, 2),
    out_of_band                 BOOLEAN NOT NULL DEFAULT FALSE,
    justification               TEXT,
    requisition_status          VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    submitted_at                TIMESTAMPTZ,
    manager_approved_by         UUID,
    manager_approved_by_name    VARCHAR(200),
    manager_approved_at         TIMESTAMPTZ,
    hr_approved_by              UUID,
    hr_approved_by_name         VARCHAR(200),
    hr_approved_at              TIMESTAMPTZ,
    director_approved_by        UUID,
    director_approved_by_name   VARCHAR(200),
    director_approved_at        TIMESTAMPTZ,
    rejected_by                 UUID,
    rejected_by_name            VARCHAR(200),
    rejected_at                 TIMESTAMPTZ,
    rejected_stage              VARCHAR(32),
    rejection_reason            TEXT,
    canceled_at                 TIMESTAMPTZ,
    job_vacancy_id              UUID,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_requisition_code
    ON job_requisition (code);

CREATE INDEX IF NOT EXISTS idx_job_requisition_company
    ON job_requisition (company_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_requisition_position
    ON job_requisition (job_position_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_requisition_status
    ON job_requisition (requisition_status)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_requisition_offboarding
    ON job_requisition (offboarding_id)
    WHERE status <> 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('56000000-0000-0000-0000-000000000001', 10061, 'jobrequisition', 'jobrequisition:read', 'Visualizar requisições de vaga'),
    ('56000000-0000-0000-0000-000000000002', 10062, 'jobrequisition', 'jobrequisition:write', 'Criar e editar requisições de vaga'),
    ('56000000-0000-0000-0000-000000000003', 10063, 'jobrequisition', 'jobrequisition:delete', 'Excluir requisições de vaga'),
    ('56000000-0000-0000-0000-000000000004', 10064, 'jobrequisition', 'jobrequisition:approvemanager', 'Aprovar requisição como gestor'),
    ('56000000-0000-0000-0000-000000000005', 10065, 'jobrequisition', 'jobrequisition:approvehr', 'Aprovar requisição como RH'),
    ('56000000-0000-0000-0000-000000000006', 10066, 'jobrequisition', 'jobrequisition:approvedirector', 'Aprovar requisição fora da faixa (diretoria)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'jobrequisition'
ON CONFLICT DO NOTHING;

-- Perfis que ja geriam vagas passam a consultar e abrir requisicoes.
INSERT INTO role_permission (role_id, permission_id)
SELECT DISTINCT rp.role_id, target.id
FROM role_permission rp
INNER JOIN permission source ON source.id = rp.permission_id
    AND source.authority = 'jobvacancy:write'
CROSS JOIN permission target
WHERE target.authority IN ('jobrequisition:read', 'jobrequisition:write')
ON CONFLICT DO NOTHING;

SELECT public.gommo_sync_admin_profile_permissions();

DO $sync_job_requisition$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.job_position', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.job_requisition', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_requisition (LIKE public.job_requisition INCLUDING ALL)',
                target_schema
            );
        END IF;

        EXECUTE format(
            $sql$
            INSERT INTO %I.permission (id, code, authority, module, description)
            SELECT p.id, p.code, p.authority, p.module, p.description
            FROM public.permission p
            WHERE p.module = 'jobrequisition'
            ON CONFLICT (id) DO NOTHING
            $sql$,
            target_schema
        );

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.module = 'jobrequisition'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );

            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT DISTINCT rp.role_id, target.id
                FROM %I.role_permission rp
                INNER JOIN %I.permission source ON source.id = rp.permission_id
                    AND source.authority = 'jobvacancy:write'
                CROSS JOIN %I.permission target
                WHERE target.authority IN ('jobrequisition:read', 'jobrequisition:write')
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_job_requisition$;
