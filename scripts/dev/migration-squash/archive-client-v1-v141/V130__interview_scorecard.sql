-- RN-36: coluna de entrevista no kanban, competencias da vaga e scorecard multi-avaliador.

ALTER TABLE admission_process_kanban_column
    ADD COLUMN IF NOT EXISTS interview_column BOOLEAN NOT NULL DEFAULT false;

UPDATE admission_process_kanban_column
SET interview_column = true
WHERE LOWER(column_key) IN ('initial_interview', 'manager_interview')
  AND status <> 'DELETED';

CREATE TABLE IF NOT EXISTS job_vacancy_competency (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL,
    status          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id      UUID,
    job_vacancy_id  UUID NOT NULL REFERENCES job_vacancy (id),
    competency_id   UUID NOT NULL REFERENCES competency (id),
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_vacancy_competency_code
    ON job_vacancy_competency (code);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_vacancy_competency_pair
    ON job_vacancy_competency (job_vacancy_id, competency_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_job_vacancy_competency_vacancy
    ON job_vacancy_competency (job_vacancy_id)
    WHERE status <> 'DELETED';

CREATE TABLE IF NOT EXISTS job_application_interview_evaluation (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL,
    status                      gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id                  UUID,
    job_vacancy_application_id  UUID NOT NULL REFERENCES job_vacancy_application (id),
    column_key                  VARCHAR(80) NOT NULL,
    evaluator_user_id           UUID NOT NULL,
    evaluator_name              VARCHAR(200),
    evaluation_status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    submitted_at                TIMESTAMPTZ,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ,
    CONSTRAINT ck_interview_evaluation_status
        CHECK (evaluation_status IN ('DRAFT', 'SUBMITTED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_application_interview_evaluation_code
    ON job_application_interview_evaluation (code);

CREATE UNIQUE INDEX IF NOT EXISTS uk_interview_evaluation_evaluator
    ON job_application_interview_evaluation (job_vacancy_application_id, column_key, evaluator_user_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_interview_evaluation_application
    ON job_application_interview_evaluation (job_vacancy_application_id, column_key)
    WHERE status <> 'DELETED';

CREATE TABLE IF NOT EXISTS job_application_interview_score (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL,
    status          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id      UUID,
    evaluation_id   UUID NOT NULL REFERENCES job_application_interview_evaluation (id),
    competency_id   UUID NOT NULL REFERENCES competency (id),
    score           INTEGER NOT NULL,
    justification   TEXT NOT NULL DEFAULT '',
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ,
    CONSTRAINT ck_interview_score_range CHECK (score BETWEEN 1 AND 5)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_application_interview_score_code
    ON job_application_interview_score (code);

CREATE UNIQUE INDEX IF NOT EXISTS uk_interview_score_competency
    ON job_application_interview_score (evaluation_id, competency_id)
    WHERE status <> 'DELETED';

CREATE INDEX IF NOT EXISTS idx_interview_score_evaluation
    ON job_application_interview_score (evaluation_id)
    WHERE status <> 'DELETED';

DO $sync_v130$
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
        IF to_regclass(format('%I.admission_process_kanban_column', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.admission_process_kanban_column '
                || 'ADD COLUMN IF NOT EXISTS interview_column BOOLEAN NOT NULL DEFAULT false',
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.admission_process_kanban_column
                SET interview_column = true
                WHERE LOWER(column_key) IN ('initial_interview', 'manager_interview')
                  AND status <> 'DELETED'
                $sql$,
                target_schema);
        END IF;

        IF to_regclass(format('%I.job_vacancy', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.competency', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.job_vacancy_competency', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_vacancy_competency (LIKE public.job_vacancy_competency INCLUDING ALL)',
                target_schema);
        END IF;

        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.job_application_interview_evaluation', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_application_interview_evaluation '
                || '(LIKE public.job_application_interview_evaluation INCLUDING ALL)',
                target_schema);
        END IF;

        IF to_regclass(format('%I.job_application_interview_evaluation', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.competency', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.job_application_interview_score', target_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.job_application_interview_score '
                || '(LIKE public.job_application_interview_score INCLUDING ALL)',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v130$;

SELECT public.gesint_audit_sync_table('admission_process_kanban_column');
SELECT public.gesint_audit_sync_table('job_vacancy_competency');
SELECT public.gesint_audit_sync_table('job_application_interview_evaluation');
SELECT public.gesint_audit_sync_table('job_application_interview_score');
