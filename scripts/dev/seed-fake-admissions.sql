-- Seed dev: admissoes fake para testes de colaboradores, ferias, folha e pagamentos.
--
-- Destino:
--   - schema public (ambiente de desenvolvimento)
--
-- Executar no PostgreSQL do Docker:
--   docker cp scripts/dev/seed-fake-admissions.sql gommo-postgres:/tmp/seed-fake-admissions.sql
--   docker exec gommo-postgres psql -v ON_ERROR_STOP=1 -U gommo -d gommo -f /tmp/seed-fake-admissions.sql
--
-- Observacoes:
--   - Cenarios de ferias pensados em torno da data 2026-06-17.
--   - Fotos ficam sem photo_object_id para evitar avatar quebrado sem arquivo local real.
--   - Documentos e contratos de admissao recebem storage_object/logical links fake
--     para o AdmissionProgressEvaluator considerar as admissoes como COMPLETED.

BEGIN;

SET search_path TO public;

CREATE TEMP TABLE _seed_fake_admission (
    n INT PRIMARY KEY,
    collaborator_id UUID NOT NULL,
    admission_id UUID NOT NULL,
    address_id UUID NOT NULL,
    contact_id UUID NOT NULL,
    contract_id UUID NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    rg VARCHAR(20),
    birth_date DATE NOT NULL,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    mother_name VARCHAR(200),
    father_name VARCHAR(200),
    pis_pasep VARCHAR(20),
    email VARCHAR(200),
    phone VARCHAR(20),
    zip_code VARCHAR(10),
    street VARCHAR(200),
    number VARCHAR(20),
    district VARCHAR(100),
    city VARCHAR(100),
    state_code VARCHAR(2),
    department_id UUID NOT NULL,
    job_position_id UUID NOT NULL,
    contract_type VARCHAR(20) NOT NULL,
    base_salary NUMERIC(14, 2),
    workload_schedule VARCHAR(32),
    workload_hours NUMERIC(5, 2),
    contract_start_date DATE NOT NULL,
    contract_end_date DATE,
    provider_cnpj VARCHAR(14),
    provider_legal_name VARCHAR(200),
    provider_trade_name VARCHAR(200),
    notes TEXT
) ON COMMIT DROP;

INSERT INTO _seed_fake_admission (
    n, collaborator_id, admission_id, address_id, contact_id, contract_id,
    full_name, cpf, rg, birth_date, gender, marital_status, mother_name, father_name, pis_pasep,
    email, phone, zip_code, street, number, district, city, state_code,
    department_id, job_position_id, contract_type, base_salary, workload_schedule, workload_hours,
    contract_start_date, contract_end_date, provider_cnpj, provider_legal_name, provider_trade_name, notes
) VALUES
    (1, 'dddddddd-0001-4000-8000-000000000001', 'eeeeeeee-0001-4000-8000-000000000001', 'adadadad-0001-4000-8000-000000000001', 'cdcdcdcd-0001-4000-8000-000000000001', 'abababab-0001-4000-8000-000000000001',
     'Ana Ribeiro', '11144477735', '45123987', '1988-04-12', 'FEMALE', 'MARRIED', 'Marcia Ribeiro', 'Paulo Ribeiro', '12345678901',
     'ana.ribeiro@gommo.test', '11991110001', '01311000', 'Avenida Paulista', '1000', 'Bela Vista', 'Sao Paulo', 'SP',
     'bbbbbbbb-0001-4000-8000-000000000001', 'cccccccc-0001-4000-8000-000000000001', 'CLT', 6200.00, '44h semanais', 44.00,
     '2016-02-15', NULL, NULL, NULL, NULL, 'CLT antigo: varios ciclos aquisitivos ja percorridos.'),
    (2, 'dddddddd-0001-4000-8000-000000000002', 'eeeeeeee-0001-4000-8000-000000000002', 'adadadad-0001-4000-8000-000000000002', 'cdcdcdcd-0001-4000-8000-000000000002', 'abababab-0001-4000-8000-000000000002',
     'Bruno Carvalho', '22255588846', '50233190', '1991-09-03', 'MALE', 'SINGLE', 'Helena Carvalho', 'Roberto Carvalho', '12345678902',
     'bruno.carvalho@gommo.test', '11991110002', '04094050', 'Rua Sena Madureira', '250', 'Vila Mariana', 'Sao Paulo', 'SP',
     'bbbbbbbb-0001-4000-8000-000000000002', 'cccccccc-0001-4000-8000-000000000004', 'CLT', 9800.00, '44h semanais', 44.00,
     '2019-11-04', NULL, NULL, NULL, NULL, 'CLT antigo para testes de folha e ferias com historico longo.'),
    (3, 'dddddddd-0001-4000-8000-000000000003', 'eeeeeeee-0001-4000-8000-000000000003', 'adadadad-0001-4000-8000-000000000003', 'cdcdcdcd-0001-4000-8000-000000000003', 'abababab-0001-4000-8000-000000000003',
     'Carla Menezes', '33366699957', '33445566', '1995-01-28', 'FEMALE', 'SINGLE', 'Lucia Menezes', 'Sergio Menezes', '12345678903',
     'carla.menezes@gommo.test', '11991110003', '30140071', 'Rua da Bahia', '777', 'Centro', 'Belo Horizonte', 'MG',
     'bbbbbbbb-0001-4000-8000-000000000003', 'cccccccc-0001-4000-8000-000000000007', 'CLT', 7100.00, '44h semanais', 44.00,
     '2024-06-18', NULL, NULL, NULL, NULL, 'CLT: periodo concessivo vence em 2026-06-17, util para teste limite.'),
    (4, 'dddddddd-0001-4000-8000-000000000004', 'eeeeeeee-0001-4000-8000-000000000004', 'adadadad-0001-4000-8000-000000000004', 'cdcdcdcd-0001-4000-8000-000000000004', 'abababab-0001-4000-8000-000000000004',
     'Diego Santos', '44477711168', '77889900', '1990-12-19', 'MALE', 'DIVORCED', 'Renata Santos', 'Carlos Santos', '12345678904',
     'diego.santos@gommo.test', '11991110004', '20040002', 'Rua Mexico', '45', 'Centro', 'Rio de Janeiro', 'RJ',
     'bbbbbbbb-0001-4000-8000-000000000004', 'cccccccc-0001-4000-8000-000000000009', 'CLT', 5400.00, '44h semanais', 44.00,
     '2024-07-01', NULL, NULL, NULL, NULL, 'CLT: periodo concessivo a vencer em 2026-06-30.'),
    (5, 'dddddddd-0001-4000-8000-000000000005', 'eeeeeeee-0001-4000-8000-000000000005', 'adadadad-0001-4000-8000-000000000005', 'cdcdcdcd-0001-4000-8000-000000000005', 'abababab-0001-4000-8000-000000000005',
     'Elisa Almeida', '55588822279', '11223344', '1998-07-07', 'FEMALE', 'SINGLE', 'Patricia Almeida', 'Nelson Almeida', '12345678905',
     'elisa.almeida@gommo.test', '11991110005', '80010000', 'Rua XV de Novembro', '345', 'Centro', 'Curitiba', 'PR',
     'bbbbbbbb-0001-4000-8000-000000000005', 'cccccccc-0001-4000-8000-000000000011', 'CLT', 4300.00, '44h semanais', 44.00,
     '2025-06-20', NULL, NULL, NULL, NULL, 'CLT: aquisicao prestes a encerrar em 2026-06-19.'),
    (6, 'dddddddd-0001-4000-8000-000000000006', 'eeeeeeee-0001-4000-8000-000000000006', 'adadadad-0001-4000-8000-000000000006', 'cdcdcdcd-0001-4000-8000-000000000006', 'abababab-0001-4000-8000-000000000006',
     'Felipe Costa', '66699933380', '66778899', '1986-03-16', 'MALE', 'MARRIED', 'Simone Costa', 'Jorge Costa', '12345678906',
     'felipe.costa@gommo.test', '11991110006', '90570020', 'Avenida Goethe', '120', 'Rio Branco', 'Porto Alegre', 'RS',
     'bbbbbbbb-0001-4000-8000-000000000002', 'cccccccc-0001-4000-8000-000000000006', 'CLT', 7600.00, '44h semanais', 44.00,
     '2025-07-05', NULL, NULL, NULL, NULL, 'CLT: aquisicao ainda em andamento e proxima de vencer em julho.'),
    (7, 'dddddddd-0001-4000-8000-000000000007', 'eeeeeeee-0001-4000-8000-000000000007', 'adadadad-0001-4000-8000-000000000007', 'cdcdcdcd-0001-4000-8000-000000000007', 'abababab-0001-4000-8000-000000000007',
     'Gabriela Lima', '77711144491', '22334455', '2000-10-30', 'FEMALE', 'SINGLE', 'Cristina Lima', 'Daniel Lima', '12345678907',
     'gabriela.lima@gommo.test', '11991110007', '41820020', 'Rua das Hortensias', '88', 'Pituba', 'Salvador', 'BA',
     'bbbbbbbb-0001-4000-8000-000000000001', 'cccccccc-0001-4000-8000-000000000002', 'CLT', 3200.00, '44h semanais', 44.00,
     '2026-06-10', NULL, NULL, NULL, NULL, 'CLT recem-admitida: aquisicao acabou de iniciar.'),
    (8, 'dddddddd-0001-4000-8000-000000000008', 'eeeeeeee-0001-4000-8000-000000000008', 'adadadad-0001-4000-8000-000000000008', 'cdcdcdcd-0001-4000-8000-000000000008', 'abababab-0001-4000-8000-000000000008',
     'Hugo Martins', '88822255502', '99887766', '1984-05-22', 'MALE', 'MARRIED', 'Teresa Martins', 'Antonio Martins', '12345678908',
     'hugo.martins@gommo.test', '11991110008', '60115000', 'Avenida Santos Dumont', '1510', 'Aldeota', 'Fortaleza', 'CE',
     'bbbbbbbb-0001-4000-8000-000000000004', 'cccccccc-0001-4000-8000-000000000010', 'CLT', 6800.00, '44h semanais', 44.00,
     '2023-01-10', NULL, NULL, NULL, NULL, 'CLT: ciclos anteriores ja vencidos para validar comportamento historico.'),
    (9, 'dddddddd-0001-4000-8000-000000000009', 'eeeeeeee-0001-4000-8000-000000000009', 'adadadad-0001-4000-8000-000000000009', 'cdcdcdcd-0001-4000-8000-000000000009', 'abababab-0001-4000-8000-000000000009',
     'Isabela Rocha', '99933366613', '55667788', '1993-11-11', 'FEMALE', 'OTHER', 'Vera Rocha', 'Eduardo Rocha', '12345678909',
     'isabela.rocha@gommo.test', '11991110009', '52011000', 'Rua do Hospicio', '620', 'Boa Vista', 'Recife', 'PE',
     'bbbbbbbb-0001-4000-8000-000000000003', 'cccccccc-0001-4000-8000-000000000008', 'CLT', 4800.00, '44h semanais', 44.00,
     '2024-01-15', NULL, NULL, NULL, NULL, 'CLT: primeiro periodo concessivo ja passou; util para revelar regra de periodo ativo.'),
    (10, 'dddddddd-0001-4000-8000-000000000010', 'eeeeeeee-0001-4000-8000-000000000010', 'adadadad-0001-4000-8000-000000000010', 'cdcdcdcd-0001-4000-8000-000000000010', 'abababab-0001-4000-8000-000000000010',
     'Joao Pereira', '12345678909', '13572468', '1989-08-25', 'MALE', 'SINGLE', 'Fatima Pereira', 'Mario Pereira', '12345678910',
     'joao.pereira@gommo.test', '11991110010', '70040900', 'SCS Quadra 2', '30', 'Asa Sul', 'Brasilia', 'DF',
     'bbbbbbbb-0001-4000-8000-000000000005', 'cccccccc-0001-4000-8000-000000000012', 'CLT', 3900.00, '44h semanais', 44.00,
     '2022-09-01', NULL, NULL, NULL, NULL, 'CLT antigo para testes de elegibilidade e salario base.'),
    (11, 'dddddddd-0001-4000-8000-000000000011', 'eeeeeeee-0001-4000-8000-000000000011', 'adadadad-0001-4000-8000-000000000011', 'cdcdcdcd-0001-4000-8000-000000000011', 'abababab-0001-4000-8000-000000000011',
     'Larissa Teixeira', '98765432100', '86421357', '1999-02-14', 'FEMALE', 'SINGLE', 'Claudia Teixeira', 'Ronaldo Teixeira', '12345678911',
     'larissa.teixeira@gommo.test', '11991110011', '04543011', 'Rua Funchal', '411', 'Vila Olimpia', 'Sao Paulo', 'SP',
     'bbbbbbbb-0001-4000-8000-000000000002', 'cccccccc-0001-4000-8000-000000000005', 'CLT', 6700.00, '44h semanais', 44.00,
     '2026-07-01', NULL, NULL, NULL, NULL, 'CLT com inicio futuro proximo para testes de admissao e contrato a iniciar.'),
    (12, 'dddddddd-0001-4000-8000-000000000012', 'eeeeeeee-0001-4000-8000-000000000012', 'adadadad-0001-4000-8000-000000000012', 'cdcdcdcd-0001-4000-8000-000000000012', 'abababab-0001-4000-8000-000000000012',
     'Marcos Oliveira', '14725836910', '24681357', '1982-06-17', 'MALE', 'MARRIED', 'Odete Oliveira', 'Silvio Oliveira', '12345678912',
     'marcos.oliveira@gommo.test', '11991110012', '38400002', 'Avenida Afonso Pena', '2020', 'Centro', 'Uberlandia', 'MG',
     'bbbbbbbb-0001-4000-8000-000000000001', 'cccccccc-0001-4000-8000-000000000003', 'CLT', 11200.00, '44h semanais', 44.00,
     '2021-06-17', NULL, NULL, NULL, NULL, 'CLT senior: referencia de longa contratacao com salario alto.'),
    (13, 'dddddddd-0001-4000-8000-000000000013', 'eeeeeeee-0001-4000-8000-000000000013', 'adadadad-0001-4000-8000-000000000013', 'cdcdcdcd-0001-4000-8000-000000000013', 'abababab-0001-4000-8000-000000000013',
     'Marina Duarte', '25836914721', '97531864', '1992-03-09', 'FEMALE', 'SINGLE', 'Regina Duarte', 'Afonso Duarte', NULL,
     'marina.duarte@gommo.test', '11991110013', '88015000', 'Rua Felipe Schmidt', '90', 'Centro', 'Florianopolis', 'SC',
     'bbbbbbbb-0001-4000-8000-000000000002', 'cccccccc-0001-4000-8000-000000000005', 'PJ', 18500.00, NULL, NULL,
     '2022-04-01', NULL, '11222333000199', 'Marina Duarte Tecnologia Ltda', 'MD Tech', 'PJ antigo sem direito CLT de ferias.'),
    (14, 'dddddddd-0001-4000-8000-000000000014', 'eeeeeeee-0001-4000-8000-000000000014', 'adadadad-0001-4000-8000-000000000014', 'cdcdcdcd-0001-4000-8000-000000000014', 'abababab-0001-4000-8000-000000000014',
     'Rafael Nunes', '36914725832', '64289731', '1987-12-02', 'MALE', 'DIVORCED', 'Sueli Nunes', 'Fernando Nunes', NULL,
     'rafael.nunes@gommo.test', '11991110014', '66055000', 'Avenida Nazare', '101', 'Nazare', 'Belem', 'PA',
     'bbbbbbbb-0001-4000-8000-000000000004', 'cccccccc-0001-4000-8000-000000000009', 'PJ', 13200.00, NULL, NULL,
     '2024-12-01', NULL, '22333444000188', 'Rafael Nunes Consultoria Ltda', 'RN Consultoria', 'PJ em contrato ativo recente.'),
    (15, 'dddddddd-0001-4000-8000-000000000015', 'eeeeeeee-0001-4000-8000-000000000015', 'adadadad-0001-4000-8000-000000000015', 'cdcdcdcd-0001-4000-8000-000000000015', 'abababab-0001-4000-8000-000000000015',
     'Patricia Gomes', '74185296343', '31864297', '1996-06-01', 'FEMALE', 'SINGLE', 'Neide Gomes', 'Gilberto Gomes', NULL,
     'patricia.gomes@gommo.test', '11991110015', '57020000', 'Rua do Comercio', '170', 'Centro', 'Maceio', 'AL',
     'bbbbbbbb-0001-4000-8000-000000000003', 'cccccccc-0001-4000-8000-000000000007', 'PJ', 9800.00, NULL, NULL,
     '2026-06-24', NULL, '33444555000177', 'Patricia Gomes Servicos Contabeis Ltda', 'PG Contabil', 'PJ com inicio futuro proximo.'),
    (16, 'dddddddd-0001-4000-8000-000000000016', 'eeeeeeee-0001-4000-8000-000000000016', 'adadadad-0001-4000-8000-000000000016', 'cdcdcdcd-0001-4000-8000-000000000016', 'abababab-0001-4000-8000-000000000016',
     'Tiago Ferreira', '85296374154', '72918364', '1985-09-18', 'MALE', 'MARRIED', 'Ivone Ferreira', 'Luis Ferreira', NULL,
     'tiago.ferreira@gommo.test', '11991110016', '29010001', 'Avenida Jeronimo Monteiro', '300', 'Centro', 'Vitoria', 'ES',
     'bbbbbbbb-0001-4000-8000-000000000005', 'cccccccc-0001-4000-8000-000000000011', 'PJ', 11500.00, NULL, NULL,
     '2025-03-15', NULL, '44555666000166', 'Tiago Ferreira Representacoes Ltda', 'TF Representacoes', 'PJ ativo para comparacao em telas de ferias.');

INSERT INTO company (
    id, status, legal_name, trade_name, cnpj, email, phone, street, number, district,
    city, state_code, zip_code, tax_regime, code, created_at, updated_at
)
SELECT
    'aaaaaaaa-0001-4000-8000-000000000001'::uuid,
    'ACTIVE', 'Empresa A Ltda', 'Empresa A', '11222333000181',
    'contato@empresa-a.local', '1130000000', 'Avenida Paulista', '1000', 'Bela Vista',
    'Sao Paulo', 'SP', '01311000', 'Simples Nacional',
    COALESCE((SELECT MAX(code) FROM company), 0) + 1,
    now(), now()
WHERE NOT EXISTS (
    SELECT 1 FROM company WHERE id = 'aaaaaaaa-0001-4000-8000-000000000001'::uuid
)
ON CONFLICT (id) DO UPDATE SET
    legal_name = EXCLUDED.legal_name,
    trade_name = EXCLUDED.trade_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = now();

WITH rows(id, parent_id, name, cost_center, description, monthly_budget, location, phone, email) AS (
    VALUES
        ('bbbbbbbb-0001-4000-8000-000000000001'::uuid, NULL::uuid, 'Pessoas e Cultura', 'RH-001', 'Departamento de RH e DP.', 120000.00, 'Sao Paulo - Matriz', '1130010001', 'pessoas@gommo.test'),
        ('bbbbbbbb-0001-4000-8000-000000000002'::uuid, NULL::uuid, 'Engenharia', 'ENG-001', 'Produtos digitais e plataforma.', 280000.00, 'Sao Paulo - Hibrido', '1130010002', 'engenharia@gommo.test'),
        ('bbbbbbbb-0001-4000-8000-000000000003'::uuid, NULL::uuid, 'Contabilidade', 'CTB-001', 'Contabilidade, folha e fiscal.', 90000.00, 'Belo Horizonte - Remoto', '1130010003', 'contabilidade@gommo.test'),
        ('bbbbbbbb-0001-4000-8000-000000000004'::uuid, NULL::uuid, 'Operacoes', 'OPS-001', 'Operacao interna e suporte.', 150000.00, 'Rio de Janeiro - Hibrido', '1130010004', 'operacoes@gommo.test'),
        ('bbbbbbbb-0001-4000-8000-000000000005'::uuid, NULL::uuid, 'Comercial', 'COM-001', 'Vendas e relacionamento.', 110000.00, 'Sao Paulo - Remoto', '1130010005', 'comercial@gommo.test')
),
numbered AS (
    SELECT rows.*, ROW_NUMBER() OVER (ORDER BY name) AS rn FROM rows
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM department
)
INSERT INTO department (
    id, status, company_id, parent_id, name, cost_center, description, monthly_budget,
    location, phone, email, responsible_collaborator_ids, code, created_at, updated_at
)
SELECT
    id, 'ACTIVE', 'aaaaaaaa-0001-4000-8000-000000000001'::uuid, parent_id,
    name, cost_center, description, monthly_budget, location, phone, email,
    '[]'::jsonb, (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    parent_id = EXCLUDED.parent_id,
    name = EXCLUDED.name,
    cost_center = EXCLUDED.cost_center,
    description = EXCLUDED.description,
    monthly_budget = EXCLUDED.monthly_budget,
    location = EXCLUDED.location,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    updated_at = now();

WITH rows(id, department_id, title, cbo_code, description) AS (
    VALUES
        ('cccccccc-0001-4000-8000-000000000001'::uuid, 'bbbbbbbb-0001-4000-8000-000000000001'::uuid, 'Analista de RH', '252405', 'Recrutamento, admissao e desenvolvimento.'),
        ('cccccccc-0001-4000-8000-000000000002'::uuid, 'bbbbbbbb-0001-4000-8000-000000000001'::uuid, 'Assistente de DP', '411010', 'Rotinas de departamento pessoal.'),
        ('cccccccc-0001-4000-8000-000000000003'::uuid, 'bbbbbbbb-0001-4000-8000-000000000001'::uuid, 'Business Partner', '252405', 'Apoio consultivo as areas de negocio.'),
        ('cccccccc-0001-4000-8000-000000000004'::uuid, 'bbbbbbbb-0001-4000-8000-000000000002'::uuid, 'Desenvolvedor Backend', '212405', 'APIs, integracoes e regras de negocio.'),
        ('cccccccc-0001-4000-8000-000000000005'::uuid, 'bbbbbbbb-0001-4000-8000-000000000002'::uuid, 'Desenvolvedora Frontend', '212420', 'Interfaces web e experiencia do usuario.'),
        ('cccccccc-0001-4000-8000-000000000006'::uuid, 'bbbbbbbb-0001-4000-8000-000000000002'::uuid, 'Analista de QA', '317110', 'Testes funcionais e automatizados.'),
        ('cccccccc-0001-4000-8000-000000000007'::uuid, 'bbbbbbbb-0001-4000-8000-000000000003'::uuid, 'Analista Contabil', '252210', 'Lancamentos contabeis e folha.'),
        ('cccccccc-0001-4000-8000-000000000008'::uuid, 'bbbbbbbb-0001-4000-8000-000000000003'::uuid, 'Assistente Financeiro', '413110', 'Contas, documentos e conciliacao.'),
        ('cccccccc-0001-4000-8000-000000000009'::uuid, 'bbbbbbbb-0001-4000-8000-000000000004'::uuid, 'Coordenador de Operacoes', '142105', 'Coordenacao operacional.'),
        ('cccccccc-0001-4000-8000-000000000010'::uuid, 'bbbbbbbb-0001-4000-8000-000000000004'::uuid, 'Analista de Operacoes', '252105', 'Processos internos e suporte.'),
        ('cccccccc-0001-4000-8000-000000000011'::uuid, 'bbbbbbbb-0001-4000-8000-000000000005'::uuid, 'Executivo Comercial', '354705', 'Vendas consultivas.'),
        ('cccccccc-0001-4000-8000-000000000012'::uuid, 'bbbbbbbb-0001-4000-8000-000000000005'::uuid, 'SDR', '354705', 'Prospeccao e qualificacao comercial.')
),
numbered AS (
    SELECT rows.*, ROW_NUMBER() OVER (ORDER BY title) AS rn FROM rows
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM job_position
)
INSERT INTO job_position (
    id, status, department_id, title, cbo_code, description, code, created_at, updated_at
)
SELECT
    id, 'ACTIVE', department_id, title, cbo_code, description,
    (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    title = EXCLUDED.title,
    cbo_code = EXCLUDED.cbo_code,
    description = EXCLUDED.description,
    updated_at = now();

WITH numbered AS (
    SELECT s.*, ROW_NUMBER() OVER (ORDER BY s.n) AS rn FROM _seed_fake_admission s
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM collaborator
)
INSERT INTO collaborator (
    id, status, full_name, cpf, rg, rg_issuer, rg_state_code, birth_date, gender,
    marital_status, mother_name, father_name, nationality, pis_pasep, photo_object_id,
    code, created_at, updated_at
)
SELECT
    collaborator_id, 'ACTIVE', full_name, cpf, rg, 'SSP', state_code, birth_date,
    gender::gender_enum, marital_status::marital_status_enum, mother_name, father_name,
    'Brasileiro', pis_pasep, NULL,
    (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    cpf = EXCLUDED.cpf,
    rg = EXCLUDED.rg,
    rg_issuer = EXCLUDED.rg_issuer,
    rg_state_code = EXCLUDED.rg_state_code,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    marital_status = EXCLUDED.marital_status,
    mother_name = EXCLUDED.mother_name,
    father_name = EXCLUDED.father_name,
    nationality = EXCLUDED.nationality,
    pis_pasep = EXCLUDED.pis_pasep,
    updated_at = now();

WITH numbered AS (
    SELECT s.*, ROW_NUMBER() OVER (ORDER BY s.n) AS rn FROM _seed_fake_admission s
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM collaborator_address
)
INSERT INTO collaborator_address (
    id, status, collaborator_id, zip_code, street, number, district, city, state_code,
    is_primary, code, created_at, updated_at
)
SELECT
    address_id, 'ACTIVE', collaborator_id, zip_code, street, number, district, city, state_code,
    true, (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    collaborator_id = EXCLUDED.collaborator_id,
    zip_code = EXCLUDED.zip_code,
    street = EXCLUDED.street,
    number = EXCLUDED.number,
    district = EXCLUDED.district,
    city = EXCLUDED.city,
    state_code = EXCLUDED.state_code,
    is_primary = EXCLUDED.is_primary,
    updated_at = now();

WITH numbered AS (
    SELECT s.*, ROW_NUMBER() OVER (ORDER BY s.n) AS rn FROM _seed_fake_admission s
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM collaborator_contact
)
INSERT INTO collaborator_contact (
    id, status, collaborator_id, email, phone, is_primary, code, created_at, updated_at
)
SELECT
    contact_id, 'ACTIVE', collaborator_id, email, phone, true,
    (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    collaborator_id = EXCLUDED.collaborator_id,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    is_primary = EXCLUDED.is_primary,
    updated_at = now();

WITH numbered AS (
    SELECT s.*, ROW_NUMBER() OVER (ORDER BY s.n) AS rn FROM _seed_fake_admission s
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM employment_contract
)
INSERT INTO employment_contract (
    id, status, collaborator_id, company_id, job_position_id, contract_type, start_date,
    end_date, base_salary, workload_hours, notes, code, created_at, updated_at
)
SELECT
    contract_id, 'ACTIVE', collaborator_id, 'aaaaaaaa-0001-4000-8000-000000000001'::uuid,
    job_position_id, contract_type::contract_type_enum, contract_start_date, contract_end_date,
    base_salary, workload_hours,
    CASE WHEN contract_type = 'PJ'
        THEN 'Contrato PJ criado pelo seed de admissoes fake.'
        ELSE 'Contrato CLT criado pelo seed de admissoes fake.'
    END,
    (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    collaborator_id = EXCLUDED.collaborator_id,
    company_id = EXCLUDED.company_id,
    job_position_id = EXCLUDED.job_position_id,
    contract_type = EXCLUDED.contract_type,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    base_salary = EXCLUDED.base_salary,
    workload_hours = EXCLUDED.workload_hours,
    notes = EXCLUDED.notes,
    updated_at = now();

WITH numbered AS (
    SELECT s.*, ROW_NUMBER() OVER (ORDER BY s.n) AS rn FROM _seed_fake_admission s
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM admission_process
)
INSERT INTO admission_process (
    id, status, collaborator_id, admission_status, started_at, completed_at, notes,
    full_name, cpf, rg, rg_issuer, rg_state_code, birth_date, gender, marital_status,
    mother_name, father_name, nationality, pis_pasep, email, phone, zip_code, street,
    number, district, city, state_code, expected_start_date, company_id, department_id,
    job_position_id, contract_type, base_salary, workload_schedule, emergency_contacts,
    contract_start_date, contract_end_date, provider_cnpj, provider_legal_name,
    provider_trade_name, photo_object_id, code, created_at, updated_at
)
SELECT
    admission_id, 'ACTIVE', collaborator_id, 'COMPLETED'::admission_status_enum,
    (contract_start_date - INTERVAL '30 days')::date,
    LEAST((contract_start_date - INTERVAL '1 day')::date, DATE '2026-06-16'),
    notes,
    full_name, cpf, rg, 'SSP', state_code, birth_date, gender::gender_enum,
    marital_status::marital_status_enum, mother_name, father_name, 'Brasileiro',
    pis_pasep, email, phone, zip_code, street, number, district, city, state_code,
    contract_start_date, 'aaaaaaaa-0001-4000-8000-000000000001'::uuid, department_id,
    job_position_id, contract_type::contract_type_enum, base_salary, workload_schedule,
    jsonb_build_array(jsonb_build_object(
        'name', 'Contato ' || split_part(full_name, ' ', 1),
        'phone', phone,
        'relationship', 'Familiar'
    )),
    contract_start_date, contract_end_date, provider_cnpj, provider_legal_name,
    provider_trade_name, NULL,
    (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    collaborator_id = EXCLUDED.collaborator_id,
    admission_status = EXCLUDED.admission_status,
    started_at = EXCLUDED.started_at,
    completed_at = EXCLUDED.completed_at,
    notes = EXCLUDED.notes,
    full_name = EXCLUDED.full_name,
    cpf = EXCLUDED.cpf,
    rg = EXCLUDED.rg,
    rg_issuer = EXCLUDED.rg_issuer,
    rg_state_code = EXCLUDED.rg_state_code,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    marital_status = EXCLUDED.marital_status,
    mother_name = EXCLUDED.mother_name,
    father_name = EXCLUDED.father_name,
    nationality = EXCLUDED.nationality,
    pis_pasep = EXCLUDED.pis_pasep,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    zip_code = EXCLUDED.zip_code,
    street = EXCLUDED.street,
    number = EXCLUDED.number,
    district = EXCLUDED.district,
    city = EXCLUDED.city,
    state_code = EXCLUDED.state_code,
    expected_start_date = EXCLUDED.expected_start_date,
    company_id = EXCLUDED.company_id,
    department_id = EXCLUDED.department_id,
    job_position_id = EXCLUDED.job_position_id,
    contract_type = EXCLUDED.contract_type,
    base_salary = EXCLUDED.base_salary,
    workload_schedule = EXCLUDED.workload_schedule,
    emergency_contacts = EXCLUDED.emergency_contacts,
    contract_start_date = EXCLUDED.contract_start_date,
    contract_end_date = EXCLUDED.contract_end_date,
    provider_cnpj = EXCLUDED.provider_cnpj,
    provider_legal_name = EXCLUDED.provider_legal_name,
    provider_trade_name = EXCLUDED.provider_trade_name,
    updated_at = now();

WITH objects AS (
    SELECT
        ('30000000-0000-4000-8000-' || LPAD(n::text, 12, '0'))::uuid AS id,
        admission_id,
        n,
        'DOCUMENT' AS link_role,
        'Documento pessoal - ' || full_name AS display_name,
        'PERSONAL_DOCUMENT' AS document_type,
        'dev-seed/admissions/' || cpf || '/documento-pessoal.pdf' AS object_key
    FROM _seed_fake_admission
    UNION ALL
    SELECT
        ('30000001-0000-4000-8000-' || LPAD(n::text, 12, '0'))::uuid AS id,
        admission_id,
        n,
        'CONTRACT' AS link_role,
        'Contrato assinado - ' || full_name AS display_name,
        'SIGNED_CONTRACT' AS document_type,
        'dev-seed/admissions/' || cpf || '/contrato-assinado.pdf' AS object_key
    FROM _seed_fake_admission
),
numbered AS (
    SELECT objects.*, ROW_NUMBER() OVER (ORDER BY n, link_role) AS rn FROM objects
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM storage_object
)
INSERT INTO storage_object (
    id, status, bucket, object_key, version_id, is_latest, content_type, content_length,
    etag, storage_class, local_file_path, sha256_hex, metadata, code, created_at, updated_at
)
SELECT
    id, 'ACTIVE', 'gommo-local', object_key, 'null', true, 'application/pdf', 0,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'STANDARD', NULL,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    jsonb_build_object('seed', 'fake-admissions', 'downloadable', false),
    (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    bucket = EXCLUDED.bucket,
    object_key = EXCLUDED.object_key,
    version_id = EXCLUDED.version_id,
    is_latest = EXCLUDED.is_latest,
    content_type = EXCLUDED.content_type,
    content_length = EXCLUDED.content_length,
    etag = EXCLUDED.etag,
    storage_class = EXCLUDED.storage_class,
    local_file_path = EXCLUDED.local_file_path,
    sha256_hex = EXCLUDED.sha256_hex,
    metadata = EXCLUDED.metadata,
    updated_at = now();

WITH links AS (
    SELECT
        ('31000000-0000-4000-8000-' || LPAD(n::text, 12, '0'))::uuid AS id,
        ('30000000-0000-4000-8000-' || LPAD(n::text, 12, '0'))::uuid AS storage_object_id,
        admission_id AS entity_id,
        n,
        'DOCUMENT' AS link_role,
        'Documento pessoal - ' || full_name AS display_name,
        'PERSONAL_DOCUMENT' AS document_type
    FROM _seed_fake_admission
    UNION ALL
    SELECT
        ('31000001-0000-4000-8000-' || LPAD(n::text, 12, '0'))::uuid AS id,
        ('30000001-0000-4000-8000-' || LPAD(n::text, 12, '0'))::uuid AS storage_object_id,
        admission_id AS entity_id,
        n,
        'CONTRACT' AS link_role,
        'Contrato assinado - ' || full_name AS display_name,
        'SIGNED_CONTRACT' AS document_type
    FROM _seed_fake_admission
),
numbered AS (
    SELECT links.*, ROW_NUMBER() OVER (ORDER BY n, link_role) AS rn FROM links
),
max_code AS (
    SELECT COALESCE(MAX(code), 0) AS value FROM storage_object_link
)
INSERT INTO storage_object_link (
    id, status, storage_object_id, entity_type, entity_id, link_role, display_name,
    document_type, code, created_at, updated_at
)
SELECT
    id, 'ACTIVE', storage_object_id, 'admission_process', entity_id, link_role,
    display_name, document_type, (SELECT value FROM max_code) + rn, now(), now()
FROM numbered
ON CONFLICT (id) DO UPDATE SET
    storage_object_id = EXCLUDED.storage_object_id,
    entity_type = EXCLUDED.entity_type,
    entity_id = EXCLUDED.entity_id,
    link_role = EXCLUDED.link_role,
    display_name = EXCLUDED.display_name,
    document_type = EXCLUDED.document_type,
    updated_at = now();

COMMIT;

SELECT 'fake_admissions' AS seed, COUNT(*) AS total
FROM public.admission_process
WHERE id BETWEEN 'eeeeeeee-0001-4000-8000-000000000001'::uuid
          AND 'eeeeeeee-0001-4000-8000-000000000016'::uuid;
