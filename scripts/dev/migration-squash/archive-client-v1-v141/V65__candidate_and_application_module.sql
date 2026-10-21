-- Candidato e candidatura (N:N com job_vacancy) + permissoes RBAC.

CREATE TABLE IF NOT EXISTS candidate (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    full_name       VARCHAR(200) NOT NULL,
    cpf             VARCHAR(14) NOT NULL,
    email           VARCHAR(200),
    phone           VARCHAR(20),
    birth_date      DATE,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_candidate_cpf_active
    ON candidate (cpf)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_candidate_full_name
    ON candidate (full_name)
    WHERE status <> 'DELETED';

CREATE TABLE IF NOT EXISTS job_vacancy_application (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                INTEGER NOT NULL UNIQUE,
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    job_vacancy_id      UUID NOT NULL REFERENCES job_vacancy (id),
    candidate_id        UUID NOT NULL REFERENCES candidate (id),
    application_status  VARCHAR(32) NOT NULL DEFAULT 'APPLIED',
    applied_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_vacancy_application_pair_active
    ON job_vacancy_application (job_vacancy_id, candidate_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_vacancy_application_vacancy
    ON job_vacancy_application (job_vacancy_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_vacancy_application_candidate
    ON job_vacancy_application (candidate_id)
    WHERE status <> 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('47000000-0000-0000-0000-000000000001', 9701, 'candidate', 'candidate:read', 'Visualizar candidatos'),
    ('47000000-0000-0000-0000-000000000002', 9702, 'candidate', 'candidate:write', 'Criar e editar candidatos'),
    ('47000000-0000-0000-0000-000000000003', 9703, 'candidate', 'candidate:delete', 'Excluir candidatos'),
    ('48000000-0000-0000-0000-000000000001', 9801, 'jobvacancyapplication', 'jobvacancyapplication:read', 'Visualizar candidaturas'),
    ('48000000-0000-0000-0000-000000000002', 9802, 'jobvacancyapplication', 'jobvacancyapplication:write', 'Criar e editar candidaturas'),
    ('48000000-0000-0000-0000-000000000003', 9803, 'jobvacancyapplication', 'jobvacancyapplication:delete', 'Excluir candidaturas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module IN ('candidate', 'jobvacancyapplication')
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE module IN ('candidate', 'jobvacancyapplication') AND authority NOT LIKE '%:delete'
ON CONFLICT DO NOTHING;

-- Espelha tabelas + permissoes nos schemas tenant_* existentes.
DO $sync_candidate_application$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.candidate', target_schema)) IS NULL
           AND to_regclass('public.candidate') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.candidate (LIKE public.candidate INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NULL
           AND to_regclass('public.job_vacancy_application') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_vacancy_application (LIKE public.job_vacancy_application INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.permission (id, code, authority, module, description)
                SELECT p.id, p.code, p.authority, p.module, p.description
                FROM public.permission p
                WHERE p.module IN ('candidate', 'jobvacancyapplication')
                ON CONFLICT (id) DO NOTHING
                $sql$,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT rp.role_id, rp.permission_id
                FROM public.role_permission rp
                INNER JOIN public.permission p ON p.id = rp.permission_id
                WHERE p.module IN ('candidate', 'jobvacancyapplication')
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema
            );

            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.module IN ('candidate', 'jobvacancyapplication')
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_candidate_application$;
