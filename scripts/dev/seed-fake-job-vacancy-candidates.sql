-- Seed dev: 1 vaga + 10 candidatos + candidaturas (fluxo Vagas → Admissão).
--
-- Destino:
--   - schema public (ambiente de desenvolvimento)
--
-- Pré-requisito:
--   - Flyway V65 (tabelas candidate / job_vacancy_application)
--
-- Executar no PostgreSQL do Docker:
--   docker cp scripts/dev/seed-fake-job-vacancy-candidates.sql gommo-postgres:/tmp/seed-fake-job-vacancy-candidates.sql
--   docker exec gommo-postgres psql -v ON_ERROR_STOP=1 -U gommo -d gommo -f /tmp/seed-fake-job-vacancy-candidates.sql
--
-- Observacoes:
--   - Idempotente: UUIDs fixos + WHERE NOT EXISTS.
--   - Codes de seed usam faixa alta (91xxx) para nao colidir com sequenciais reais.

BEGIN;

SET search_path TO public;

-- Vaga
INSERT INTO job_vacancy (
    id,
    code,
    status,
    job_title,
    positions_count,
    description,
    activities,
    assignments,
    seniority_level,
    salary,
    expected_completion_date,
    target_boards,
    created_at,
    updated_at
)
SELECT
    'a1a1a1a1-0001-4000-8000-000000000001'::uuid,
    91001,
    'ACTIVE'::status_enum,
    'Analista de RH — seed',
    2,
    'Vaga seed para testes do funil de recrutamento ate a admissao.',
    'Triagem de curriculos, acompanhamento de candidaturas e suporte a entrevistas.',
    'RH corporativo — equipe de recrutamento e selecao.',
    'PLENO',
    7500.00,
    CURRENT_DATE + INTERVAL '45 days',
    '["LINKEDIN","CATHO"]'::jsonb,
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM job_vacancy WHERE id = 'a1a1a1a1-0001-4000-8000-000000000001'::uuid
);

-- Candidatos (10)
CREATE TEMP TABLE _seed_fake_candidate (
    n INT PRIMARY KEY,
    candidate_id UUID NOT NULL,
    application_id UUID NOT NULL,
    code INT NOT NULL,
    application_code INT NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL
) ON COMMIT DROP;

INSERT INTO _seed_fake_candidate (
    n, candidate_id, application_id, code, application_code,
    full_name, cpf, email, phone, birth_date
) VALUES
    (1,  'b2b2b2b2-0001-4000-8000-000000000001', 'c3c3c3c3-0001-4000-8000-000000000001', 91101, 91201,
     'Amanda Souza Lima', '39053344705', 'amanda.lima@gommo.test', '11992010001', '1994-03-12'),
    (2,  'b2b2b2b2-0001-4000-8000-000000000002', 'c3c3c3c3-0001-4000-8000-000000000002', 91102, 91202,
     'Bruno Ferreira Costa', '15350946080', 'bruno.costa@gommo.test', '11992010002', '1990-07-22'),
    (3,  'b2b2b2b2-0001-4000-8000-000000000003', 'c3c3c3c3-0001-4000-8000-000000000003', 91103, 91203,
     'Camila Duarte Alves', '52998224725', 'camila.alves@gommo.test', '11992010003', '1996-11-05'),
    (4,  'b2b2b2b2-0001-4000-8000-000000000004', 'c3c3c3c3-0001-4000-8000-000000000004', 91104, 91204,
     'Diego Martins Rocha', '11144477735', 'diego.rocha@gommo.test', '11992010004', '1989-01-18'),
    (5,  'b2b2b2b2-0001-4000-8000-000000000005', 'c3c3c3c3-0001-4000-8000-000000000005', 91105, 91205,
     'Eduarda Nunes Pinto', '22255588846', 'eduarda.pinto@gommo.test', '11992010005', '1993-09-30'),
    (6,  'b2b2b2b2-0001-4000-8000-000000000006', 'c3c3c3c3-0001-4000-8000-000000000006', 91106, 91206,
     'Felipe Araujo Mendes', '33366699957', 'felipe.mendes@gommo.test', '11992010006', '1991-05-14'),
    (7,  'b2b2b2b2-0001-4000-8000-000000000007', 'c3c3c3c3-0001-4000-8000-000000000007', 91107, 91207,
     'Gabriela Prado Silva', '44477700068', 'gabriela.silva@gommo.test', '11992010007', '1997-12-08'),
    (8,  'b2b2b2b2-0001-4000-8000-000000000008', 'c3c3c3c3-0001-4000-8000-000000000008', 91108, 91208,
     'Henrique Lopes Barbosa', '55588811179', 'henrique.barbosa@gommo.test', '11992010008', '1988-08-25'),
    (9,  'b2b2b2b2-0001-4000-8000-000000000009', 'c3c3c3c3-0001-4000-8000-000000000009', 91109, 91209,
     'Isabela Castro Freitas', '66699922280', 'isabela.freitas@gommo.test', '11992010009', '1995-04-02'),
    (10, 'b2b2b2b2-0001-4000-8000-00000000000a', 'c3c3c3c3-0001-4000-8000-00000000000a', 91110, 91210,
     'Joao Pedro Teixeira', '77700033391', 'joao.teixeira@gommo.test', '11992010010', '1992-10-19');

INSERT INTO candidate (
    id, code, status, full_name, cpf, email, phone, birth_date, created_at, updated_at
)
SELECT
    s.candidate_id,
    s.code,
    'ACTIVE'::status_enum,
    s.full_name,
    s.cpf,
    s.email,
    s.phone,
    s.birth_date,
    now(),
    now()
FROM _seed_fake_candidate s
WHERE NOT EXISTS (
    SELECT 1 FROM candidate c WHERE c.id = s.candidate_id
);

INSERT INTO job_vacancy_application (
    id,
    code,
    status,
    job_vacancy_id,
    candidate_id,
    application_status,
    applied_at,
    created_at,
    updated_at
)
SELECT
    s.application_id,
    s.application_code,
    'ACTIVE'::status_enum,
    'a1a1a1a1-0001-4000-8000-000000000001'::uuid,
    s.candidate_id,
    'APPLIED',
    now() - ((11 - s.n) || ' days')::interval,
    now(),
    now()
FROM _seed_fake_candidate s
WHERE NOT EXISTS (
    SELECT 1 FROM job_vacancy_application a WHERE a.id = s.application_id
);

COMMIT;
