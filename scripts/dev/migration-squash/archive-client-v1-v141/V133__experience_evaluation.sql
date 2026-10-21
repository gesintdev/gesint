-- RN-41 / RN-13: avaliacao de experiencia 45/90 dias.

ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS experience_period VARCHAR(32),
    ADD COLUMN IF NOT EXISTS experience_extension_used BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS experience_milestone_days INTEGER,
    ADD COLUMN IF NOT EXISTS experience_due_date DATE,
    ADD COLUMN IF NOT EXISTS experience_status VARCHAR(32) NOT NULL DEFAULT 'NONE';

ALTER TABLE employment_contract
    ADD COLUMN IF NOT EXISTS experience_period VARCHAR(32),
    ADD COLUMN IF NOT EXISTS experience_extension_used BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS experience_milestone_days INTEGER,
    ADD COLUMN IF NOT EXISTS experience_due_date DATE,
    ADD COLUMN IF NOT EXISTS experience_status VARCHAR(32) NOT NULL DEFAULT 'NONE';

CREATE TABLE IF NOT EXISTS experience_evaluation (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL,
    status                      gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id                  UUID,
    collaborator_id             UUID NOT NULL,
    admission_process_id        UUID NOT NULL,
    job_position_id             UUID,
    collaborator_name           VARCHAR(200),
    job_position_name           VARCHAR(200),
    admission_date              DATE,
    experience_period           VARCHAR(32) NOT NULL,
    experience_extension_used   BOOLEAN NOT NULL DEFAULT false,
    experience_milestone_days   INTEGER NOT NULL,
    experience_due_date         DATE NOT NULL,
    period_status               VARCHAR(32) NOT NULL DEFAULT 'IN_PERIOD',
    evaluation_status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    evaluator_user_id           UUID,
    evaluator_name              VARCHAR(200),
    submitted_at                TIMESTAMPTZ,
    average_score               NUMERIC(4, 1),
    selection_average           NUMERIC(4, 1),
    decision                    VARCHAR(32),
    decision_reason             VARCHAR(255),
    decision_notes              TEXT,
    decided_by                  UUID,
    decided_by_name             VARCHAR(200),
    decided_at                  TIMESTAMPTZ,
    offboarding_id              UUID,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ,
    CONSTRAINT ck_experience_evaluation_period
        CHECK (experience_period IN ('NONE', 'DAYS_30_60', 'DAYS_45_45', 'DAYS_90')),
    CONSTRAINT ck_experience_evaluation_period_status
        CHECK (period_status IN ('IN_PERIOD', 'PENDING_DECISION', 'EFFECTIVE', 'EXTENDED', 'ENDED')),
    CONSTRAINT ck_experience_evaluation_eval_status
        CHECK (evaluation_status IN ('DRAFT', 'SUBMITTED')),
    CONSTRAINT ck_experience_evaluation_decision
        CHECK (decision IS NULL OR decision IN ('EFFECTIVE', 'EXTEND', 'END', 'AUTO_EFFECTIVE'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_experience_evaluation_code
    ON experience_evaluation (code);

CREATE UNIQUE INDEX IF NOT EXISTS uk_experience_evaluation_admission
    ON experience_evaluation (admission_process_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_experience_evaluation_collaborator
    ON experience_evaluation (collaborator_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_experience_evaluation_period_status
    ON experience_evaluation (period_status, experience_due_date)
    WHERE status <> 'DELETED';

CREATE TABLE IF NOT EXISTS experience_evaluation_score (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL,
    status          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id      UUID,
    evaluation_id   UUID NOT NULL REFERENCES experience_evaluation (id),
    competency_id   UUID NOT NULL REFERENCES competency (id),
    score           INTEGER NOT NULL,
    justification   TEXT NOT NULL DEFAULT '',
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ,
    CONSTRAINT ck_experience_score_range CHECK (score BETWEEN 1 AND 4)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_experience_evaluation_score_code
    ON experience_evaluation_score (code);

CREATE UNIQUE INDEX IF NOT EXISTS uk_experience_score_competency
    ON experience_evaluation_score (evaluation_id, competency_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_experience_score_evaluation
    ON experience_evaluation_score (evaluation_id)
    WHERE status <> 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('58000000-0000-0000-0000-000000000001', 10080, 'experience', 'experience:read', 'Visualizar avaliações de experiência'),
    ('58000000-0000-0000-0000-000000000002', 10081, 'experience', 'experience:write', 'Registrar scores de experiência'),
    ('58000000-0000-0000-0000-000000000003', 10082, 'experience', 'experience:decide', 'Decidir efetivação, prorrogação ou encerramento')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'experience'
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT DISTINCT rp.role_id, target.id
FROM role_permission rp
INNER JOIN permission source ON source.id = rp.permission_id
    AND source.authority IN ('admission:write', 'jobvacancy:write', 'collaborator:write')
CROSS JOIN permission target
WHERE target.authority IN ('experience:read', 'experience:write', 'experience:decide')
ON CONFLICT DO NOTHING;

SELECT public.gesint_sync_admin_profile_permissions();

DO $sync_experience$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.admission_process', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.admission_process '
                || 'ADD COLUMN IF NOT EXISTS experience_period VARCHAR(32), '
                || 'ADD COLUMN IF NOT EXISTS experience_extension_used BOOLEAN NOT NULL DEFAULT false, '
                || 'ADD COLUMN IF NOT EXISTS experience_milestone_days INTEGER, '
                || 'ADD COLUMN IF NOT EXISTS experience_due_date DATE, '
                || 'ADD COLUMN IF NOT EXISTS experience_status VARCHAR(32) NOT NULL DEFAULT ''NONE''',
                target_schema);
        END IF;

        IF to_regclass(format('%I.employment_contract', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.employment_contract '
                || 'ADD COLUMN IF NOT EXISTS experience_period VARCHAR(32), '
                || 'ADD COLUMN IF NOT EXISTS experience_extension_used BOOLEAN NOT NULL DEFAULT false, '
                || 'ADD COLUMN IF NOT EXISTS experience_milestone_days INTEGER, '
                || 'ADD COLUMN IF NOT EXISTS experience_due_date DATE, '
                || 'ADD COLUMN IF NOT EXISTS experience_status VARCHAR(32) NOT NULL DEFAULT ''NONE''',
                target_schema);
        END IF;

        IF to_regclass(format('%I.collaborator', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.experience_evaluation', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.experience_evaluation (LIKE public.experience_evaluation INCLUDING ALL)',
                target_schema);
        END IF;

        IF to_regclass(format('%I.experience_evaluation', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.competency', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.experience_evaluation_score', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.experience_evaluation_score '
                || '(LIKE public.experience_evaluation_score INCLUDING ALL)',
                target_schema);
        END IF;

        EXECUTE format(
            $sql$
            INSERT INTO %I.permission (id, code, authority, module, description)
            SELECT p.id, p.code, p.authority, p.module, p.description
            FROM public.permission p
            WHERE p.module = 'experience'
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
                WHERE p.module = 'experience'
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
                    AND source.authority IN ('admission:write', 'jobvacancy:write', 'collaborator:write')
                CROSS JOIN %I.permission target
                WHERE target.authority IN ('experience:read', 'experience:write', 'experience:decide')
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
$sync_experience$;

SELECT public.gesint_audit_sync_table('admission_process');
SELECT public.gesint_audit_sync_table('employment_contract');
SELECT public.gesint_audit_sync_table('experience_evaluation');
SELECT public.gesint_audit_sync_table('experience_evaluation_score');
