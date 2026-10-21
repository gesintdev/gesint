-- Modulo de Controle de Exames Ocupacionais (Fase 1 - fundacao).
-- Base normativa: NR-7 / eSocial S-2220 (layout S-1.3). Sem transmissao nesta migration.
-- Enums novos nascem em gesint_types (padrao apos V79).

CREATE TYPE gesint_types.occupational_exam_type_enum AS ENUM (
    'ADMISSIONAL',
    'PERIODICO',
    'RETORNO_AO_TRABALHO',
    'MUDANCA_DE_RISCO_OCUPACIONAL',
    'DEMISSIONAL'
);

CREATE TYPE gesint_types.occupational_exam_lifecycle_status_enum AS ENUM (
    'PREVISTO',
    'CONVOCADO',
    'REALIZADO',
    'REGISTRADO',
    'TRANSMITIDO',
    'ARQUIVADO',
    'VENCIDO_INADIMPLENTE'
);

CREATE TYPE gesint_types.occupational_exam_result_enum AS ENUM (
    'FIT',
    'UNFIT'
);

CREATE TYPE gesint_types.occupational_exam_source_trigger_enum AS ENUM (
    'MATRIX_SCHEDULE',
    'ADMISSION',
    'LEAVE_RETURN',
    'POSITION_CHANGE',
    'TERMINATION',
    'MANUAL'
);

CREATE TYPE gesint_types.occupational_physician_role_enum AS ENUM (
    'EXAMINER',
    'PCMSO_COORDINATOR'
);

CREATE TYPE gesint_types.complementary_exam_result_enum AS ENUM (
    'NORMAL',
    'ALTERED',
    'NOT_PERFORMED'
);

CREATE TABLE IF NOT EXISTS medical_clinic (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL UNIQUE,
    status                      gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    corporate_name              VARCHAR(200) NOT NULL,
    cnpj                        VARCHAR(20) NOT NULL,
    address                     VARCHAR(255),
    phone                       VARCHAR(30),
    email                       VARCHAR(150),
    exams_offered               TEXT,
    accreditation_valid_until   DATE,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS occupational_physician (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    full_name       VARCHAR(180) NOT NULL,
    crm             VARCHAR(20) NOT NULL,
    crm_state       VARCHAR(2) NOT NULL,
    role            gesint_types.occupational_physician_role_enum NOT NULL,
    clinic_id       UUID REFERENCES medical_clinic (id),
    phone           VARCHAR(30),
    email           VARCHAR(150),
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

-- Tabela 27 do eSocial (procedimentos). procedure_code = codigo oficial da tabela;
-- code INTEGER segue o padrao BaseEntity (evita colisao com o codigo sequencial).
CREATE TABLE IF NOT EXISTS esocial_table27_procedure (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    procedure_code  VARCHAR(10) NOT NULL UNIQUE,
    description     VARCHAR(200) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

-- Codigos confirmados na Tabela 27 (MOS eSocial).
-- TODO: validar demais procedimentos (ex.: ECG) contra o MOS S-1.3 antes de seedar.
INSERT INTO esocial_table27_procedure (id, code, procedure_code, description, active)
VALUES
    ('81000000-0000-0000-0000-000000000001', 8101, '01', 'Audiometria tonal', true),
    ('81000000-0000-0000-0000-000000000002', 8102, '03', 'Acuidade visual', true),
    ('81000000-0000-0000-0000-000000000003', 8103, '06', 'Hemograma', true),
    ('81000000-0000-0000-0000-000000000004', 8104, '14', 'Espirometria', true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS exam_requirement (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                            INTEGER NOT NULL UNIQUE,
    status                          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    job_position_id                 UUID NOT NULL REFERENCES job_position (id),
    exam_type                       gesint_types.occupational_exam_type_enum NOT NULL,
    complementary_procedure_codes   JSONB,
    periodicity_months              INT,
    risk_basis                      TEXT,
    version_number                  INT NOT NULL DEFAULT 1,
    valid_from                      DATE NOT NULL,
    valid_until                     DATE,
    created_by                      UUID,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                      UUID,
    updated_at                      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS occupational_exam (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                            INTEGER NOT NULL UNIQUE,
    status                          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id                 UUID NOT NULL REFERENCES collaborator (id),
    job_position_id                 UUID NOT NULL REFERENCES job_position (id),
    exam_type                       gesint_types.occupational_exam_type_enum NOT NULL,
    lifecycle_status                gesint_types.occupational_exam_lifecycle_status_enum NOT NULL DEFAULT 'PREVISTO',
    clinic_id                       UUID REFERENCES medical_clinic (id),
    examiner_physician_id           UUID REFERENCES occupational_physician (id),
    coordinator_physician_id        UUID REFERENCES occupational_physician (id),
    scheduled_date                  DATE,
    clinical_exam_date              DATE,
    aso_issue_date                  DATE,
    due_date                        DATE,
    result                          gesint_types.occupational_exam_result_enum,
    cid                             VARCHAR(20),
    clinical_observations           TEXT,
    source_trigger                  gesint_types.occupational_exam_source_trigger_enum NOT NULL DEFAULT 'MANUAL',
    related_leave_request_id        UUID REFERENCES leave_request (id),
    exam_requirement_version_id     UUID REFERENCES exam_requirement (id),
    dismissal_waiver_applied        BOOLEAN NOT NULL DEFAULT false,
    dismissal_waiver_reason         TEXT,
    retention_until                 DATE,
    created_by                      UUID,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                      UUID,
    updated_at                      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS complementary_exam (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                    INTEGER NOT NULL UNIQUE,
    status                  gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    occupational_exam_id    UUID NOT NULL REFERENCES occupational_exam (id) ON DELETE CASCADE,
    procedure_code          VARCHAR(10) NOT NULL REFERENCES esocial_table27_procedure (procedure_code),
    performed_date          DATE,
    result                  gesint_types.complementary_exam_result_enum NOT NULL DEFAULT 'NOT_PERFORMED',
    created_by              UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by              UUID,
    updated_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_exam_requirement_position_type_from
    ON exam_requirement (job_position_id, exam_type, valid_from)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_occupational_exam_collaborator_type_due
    ON occupational_exam (collaborator_id, exam_type, due_date)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_occupational_exam_lifecycle
    ON occupational_exam (lifecycle_status)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_occupational_exam_collaborator_cid
    ON occupational_exam (collaborator_id, cid)
    WHERE status != 'DELETED' AND cid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_complementary_exam_occupational
    ON complementary_exam (occupational_exam_id)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_occupational_physician_clinic
    ON occupational_physician (clinic_id)
    WHERE status != 'DELETED';

-- Espelha tabelas nos schemas tenant_* existentes.
DO $sync_occupational_exam$
DECLARE
    target_schema text;
    tbl text;
    tables text[] := ARRAY[
        'medical_clinic',
        'occupational_physician',
        'esocial_table27_procedure',
        'exam_requirement',
        'occupational_exam',
        'complementary_exam'
    ];
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        FOREACH tbl IN ARRAY tables LOOP
            IF to_regclass(format('%I.%I', target_schema, tbl)) IS NULL
               AND to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
                EXECUTE format(
                    'CREATE TABLE %I.%I (LIKE public.%I INCLUDING ALL)',
                    target_schema,
                    tbl,
                    tbl
                );
            END IF;
        END LOOP;

        IF to_regclass(format('%I.esocial_table27_procedure', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.esocial_table27_procedure (
                    id, code, status, procedure_code, description, active, created_at
                )
                SELECT p.id, p.code, p.status, p.procedure_code, p.description, p.active, p.created_at
                FROM public.esocial_table27_procedure p
                ON CONFLICT (id) DO NOTHING
                $sql$,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_occupational_exam$;
