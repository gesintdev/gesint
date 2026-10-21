-- Admissão: dados do candidato + vínculo previsto (colaborador vinculado ao concluir)

ALTER TABLE admission_process
    ALTER COLUMN collaborator_id DROP NOT NULL;

ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS social_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
    ADD COLUMN IF NOT EXISTS rg VARCHAR(20),
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS gender gender_enum,
    ADD COLUMN IF NOT EXISTS marital_status marital_status_enum,
    ADD COLUMN IF NOT EXISTS mother_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS father_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS nationality VARCHAR(60) DEFAULT 'Brasileiro',
    ADD COLUMN IF NOT EXISTS pis_pasep VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email VARCHAR(200),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
    ADD COLUMN IF NOT EXISTS street VARCHAR(200),
    ADD COLUMN IF NOT EXISTS number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS complement VARCHAR(100),
    ADD COLUMN IF NOT EXISTS district VARCHAR(100),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS state_code CHAR(2),
    ADD COLUMN IF NOT EXISTS expected_start_date DATE,
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company(id),
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES department(id),
    ADD COLUMN IF NOT EXISTS job_position_id UUID REFERENCES job_position(id),
    ADD COLUMN IF NOT EXISTS contract_type contract_type_enum NOT NULL DEFAULT 'CLT',
    ADD COLUMN IF NOT EXISTS base_salary NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS workload_hours NUMERIC(5, 2);

CREATE INDEX IF NOT EXISTS idx_admission_cpf
    ON admission_process (cpf)
    WHERE status != 'DELETED' AND cpf IS NOT NULL;
