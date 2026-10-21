-- Domínios do roadmap (exceto obrigações legais / e-Social) + storage estilo S3

CREATE TYPE contract_type_enum AS ENUM ('CLT', 'PJ', 'INTERMITTENT', 'APPRENTICE', 'INTERN');
CREATE TYPE leave_type_enum AS ENUM ('VACATION', 'MEDICAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER');
CREATE TYPE dismissal_type_enum AS ENUM (
    'WITHOUT_CAUSE', 'WITH_CAUSE', 'RESIGNATION', 'AGREEMENT', 'END_OF_CONTRACT', 'OTHER'
);
CREATE TYPE payroll_status_enum AS ENUM ('DRAFT', 'PROCESSING', 'CLOSED', 'CANCELLED');
CREATE TYPE admission_status_enum AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Storage (modelo compatível com AWS S3 Object)
CREATE TABLE storage_object (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status                  status_enum NOT NULL DEFAULT 'ACTIVE',
    bucket                  VARCHAR(63) NOT NULL DEFAULT 'gesint-local',
    object_key              VARCHAR(1024) NOT NULL,
    version_id              VARCHAR(36) NOT NULL DEFAULT 'null',
    is_latest               BOOLEAN NOT NULL DEFAULT true,
    content_type            VARCHAR(255),
    content_length          BIGINT NOT NULL DEFAULT 0,
    etag                    VARCHAR(64),
    storage_class           VARCHAR(32) NOT NULL DEFAULT 'STANDARD',
    server_side_encryption  VARCHAR(32),
    local_file_path         VARCHAR(2048),
    sha256_hex              VARCHAR(64),
    metadata                JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by              UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by              UUID,
    updated_at              TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_storage_object_key_version
    ON storage_object (bucket, object_key, version_id)
    WHERE status != 'DELETED';

CREATE INDEX idx_storage_object_bucket ON storage_object (bucket) WHERE status != 'DELETED';

CREATE TABLE storage_object_link (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    storage_object_id   UUID NOT NULL REFERENCES storage_object(id),
    entity_type         VARCHAR(64) NOT NULL,
    entity_id           UUID NOT NULL,
    link_role           VARCHAR(32) NOT NULL DEFAULT 'attachment',
    display_name        VARCHAR(255),
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_storage_link_entity ON storage_object_link (entity_type, entity_id) WHERE status != 'DELETED';

-- Empresa
CREATE TABLE company (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    legal_name          VARCHAR(255) NOT NULL,
    trade_name          VARCHAR(255),
    cnpj                VARCHAR(18) NOT NULL,
    state_registration  VARCHAR(32),
    municipal_registration VARCHAR(32),
    email               VARCHAR(200),
    phone               VARCHAR(20),
    street              VARCHAR(200),
    number              VARCHAR(20),
    complement          VARCHAR(100),
    district            VARCHAR(100),
    city                VARCHAR(100),
    state_code          CHAR(2),
    zip_code            VARCHAR(10),
    tax_regime          VARCHAR(60),
    accountant_name     VARCHAR(200),
    accountant_email    VARCHAR(200),
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_company_cnpj ON company (cnpj) WHERE status != 'DELETED';

-- Organograma
CREATE TABLE department (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id      UUID REFERENCES company(id),
    parent_id       UUID REFERENCES department(id),
    name            VARCHAR(120) NOT NULL,
    cost_center     VARCHAR(40),
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX idx_department_company ON department (company_id) WHERE status != 'DELETED';

CREATE TABLE job_position (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          status_enum NOT NULL DEFAULT 'ACTIVE',
    department_id   UUID REFERENCES department(id),
    title           VARCHAR(120) NOT NULL,
    cbo_code        VARCHAR(10),
    description     TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX idx_job_position_department ON job_position (department_id) WHERE status != 'DELETED';

-- Contrato
CREATE TABLE employment_contract (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    company_id          UUID REFERENCES company(id),
    job_position_id     UUID REFERENCES job_position(id),
    contract_type       contract_type_enum NOT NULL DEFAULT 'CLT',
    start_date          DATE NOT NULL,
    end_date            DATE,
    base_salary         NUMERIC(14, 2),
    workload_hours      NUMERIC(5, 2),
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_contract_collaborator ON employment_contract (collaborator_id) WHERE status != 'DELETED';

-- Ponto
CREATE TABLE attendance_record (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    work_date           DATE NOT NULL,
    clock_in            TIME,
    clock_out           TIME,
    break_minutes       INT DEFAULT 0,
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_attendance_collaborator_date
    ON attendance_record (collaborator_id, work_date)
    WHERE status != 'DELETED';

-- Férias / afastamentos
CREATE TABLE leave_request (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    leave_type          leave_type_enum NOT NULL DEFAULT 'VACATION',
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    approved            BOOLEAN NOT NULL DEFAULT false,
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_leave_collaborator ON leave_request (collaborator_id) WHERE status != 'DELETED';

-- Folha
CREATE TABLE payroll_run (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    company_id          UUID REFERENCES company(id),
    reference_year      INT NOT NULL,
    reference_month     INT NOT NULL CHECK (reference_month BETWEEN 1 AND 12),
    payroll_status      payroll_status_enum NOT NULL DEFAULT 'DRAFT',
    processed_at        TIMESTAMPTZ,
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_payroll_run_period
    ON payroll_run (company_id, reference_year, reference_month)
    WHERE status != 'DELETED';

CREATE TABLE payslip (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    payroll_run_id      UUID NOT NULL REFERENCES payroll_run(id),
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    gross_amount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    deductions_amount   NUMERIC(14, 2) NOT NULL DEFAULT 0,
    net_amount          NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_payslip_run ON payslip (payroll_run_id) WHERE status != 'DELETED';

-- Benefícios
CREATE TABLE benefit_plan (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    name                VARCHAR(120) NOT NULL,
    benefit_type        VARCHAR(60) NOT NULL,
    monthly_value       NUMERIC(14, 2),
    description         TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

-- Admissão digital (sem e-Social)
CREATE TABLE admission_process (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    admission_status    admission_status_enum NOT NULL DEFAULT 'DRAFT',
    started_at          DATE,
    completed_at        DATE,
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_admission_collaborator ON admission_process (collaborator_id) WHERE status != 'DELETED';

-- Desligamento (rescisão + homologação em uma tela)
CREATE TABLE offboarding (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    dismissal_date      DATE NOT NULL,
    dismissal_type      dismissal_type_enum NOT NULL DEFAULT 'WITHOUT_CAUSE',
    dismissal_notes     TEXT,
    homologation_notes  TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_offboarding_collaborator ON offboarding (collaborator_id) WHERE status != 'DELETED';

-- Entrevista de desligamento
CREATE TABLE exit_interview (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    collaborator_id     UUID NOT NULL REFERENCES collaborator(id),
    interview_date      DATE NOT NULL,
    departure_reason    VARCHAR(255),
    feedback            TEXT,
    would_recommend     BOOLEAN,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_exit_interview_collaborator ON exit_interview (collaborator_id) WHERE status != 'DELETED';
