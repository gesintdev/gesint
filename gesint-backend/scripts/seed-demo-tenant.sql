-- =====================================================================================
-- Dados fake para um schema de tenant do sistema Client (gesint-backend).
--
-- COMO USAR
--   1. Troque o nome do schema na linha SET search_path abaixo (uma única linha).
--   2. Rode o arquivo INTEIRO, como um script só, numa única sessão. Em consoles de IDE
--      (DataGrip/IntelliJ, pgAdmin) use "executar arquivo/script", não "executar statement".
--   3. É uma transação só: se qualquer coisa falhar, nada entra.
--   4. Para remover tudo depois: scripts/seed-demo-tenant-rollback.sql
--
-- POR QUE NENHUM CAST DE TIPO APARECE AQUI
--   Colunas como gender, contract_type e leave_type podem ser ENUM (em public ou em
--   gesint_types, conforme a versão da base — ver V79) ou VARCHAR. Escrever 'FEMALE'::gender_enum
--   obrigaria o tipo a estar no search_path e quebraria em metade das bases.
--   Em `INSERT ... VALUES ('FEMALE')` o literal é coagido pelo tipo da COLUNA (via OID), sem
--   consultar o search_path — funciona com enum em qualquer schema e com varchar.
--   Cuidado ao editar: `INSERT ... SELECT ... FROM (VALUES ...)` NÃO tem essa propriedade;
--   ali o literal vira `text` e o insert falha. Por isso os dados fixos usam VALUES direto.
--
-- SEGURANÇA
--   - O que protege o schema template é o guarda abaixo: exige que TODAS as tabelas existam
--     no schema informado e recusa rodar se o search_path resolver para `public`.
--   - Toda linha criada leva created_by = SEED_MARKER, o que torna o rollback exato.
--   - Os ids são fixos e com prefixo reconhecível (d1.., d2.., ...), então rodar duas vezes
--     dá erro de chave primária em vez de duplicar dados.
--   - `code` vem de sequences temporárias iniciadas em MAX(code)+1 de cada tabela, porque
--     existe índice único uk_<tabela>_code e a base já tem dados do cliente.
--
-- ESCOPO: company, department, job_position, work_schedule(+day), collaborator(+address,
--   +contact), employment_contract, benefit_plan(+enrollment), attendance_record,
--   leave_request, payroll_run(+payslip, +payslip_entry), performance_review,
--   candidate, job_vacancy(+application).
-- =====================================================================================

BEGIN;

-- >>> ALTERE AQUI: schema do cliente de teste <<<
SET search_path TO "COLE_O_SCHEMA_DO_TENANT", gesint_types, public;

-- -------------------------------------------------------------------------------------
-- Guardas. Falham antes de inserir qualquer coisa.
-- -------------------------------------------------------------------------------------
DO $guard$
DECLARE
    v_schema text := current_schema();
    v_marker uuid := 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    v_missing text;
    v_count integer;
BEGIN
    IF v_schema IS NULL OR v_schema IN ('public', 'gesint_types') THEN
        RAISE EXCEPTION 'search_path aponta para "%": informe o schema do tenant.', v_schema;
    END IF;

    SELECT string_agg(t, ', ') INTO v_missing
    FROM unnest(ARRAY['company','department','job_position','work_schedule','work_schedule_day',
                      'collaborator','collaborator_address','collaborator_contact','employment_contract',
                      'benefit_plan','benefit_enrollment','attendance_record','leave_request',
                      'payroll_run','payroll_event','payslip','payslip_entry','performance_review',
                      'candidate','job_vacancy','job_vacancy_application']) AS t
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = v_schema AND table_name = t);
    IF v_missing IS NOT NULL THEN
        RAISE EXCEPTION 'Schema "%" não tem as tabelas: %. Provisione o tenant antes.', v_schema, v_missing;
    END IF;

    EXECUTE format('SELECT count(*) FROM %I.collaborator WHERE created_by = $1', v_schema)
        INTO v_count USING v_marker;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Schema "%" já tem % colaborador(es) de demo. Rode o rollback primeiro.', v_schema, v_count;
    END IF;

    -- O payroll_event é semeado pelo provisionamento; payslip_entry depende dele.
    EXECUTE format('SELECT count(*) FROM %I.payroll_event WHERE status <> ''DELETED''', v_schema) INTO v_count;
    IF v_count = 0 THEN
        RAISE EXCEPTION 'Schema "%" não tem payroll_event. Reprovisione o tenant no Admin.', v_schema;
    END IF;

    RAISE NOTICE 'Guardas OK. Semeando no schema "%".', v_schema;
END
$guard$;

-- -------------------------------------------------------------------------------------
-- Sequences temporárias para o `code`, iniciadas depois do maior valor já existente.
-- Somem sozinhas no fim da sessão.
-- -------------------------------------------------------------------------------------
DO $seq$
DECLARE
    v_tbl text;
BEGIN
    FOREACH v_tbl IN ARRAY ARRAY['company','department','job_position','work_schedule','collaborator',
                                 'collaborator_address','collaborator_contact','employment_contract',
                                 'benefit_plan','benefit_enrollment','attendance_record','leave_request',
                                 'payroll_run','payslip','payslip_entry','performance_review',
                                 'candidate','job_vacancy','job_vacancy_application']
    LOOP
        EXECUTE format('CREATE TEMP SEQUENCE seed_%s', v_tbl);
        EXECUTE format(
            'SELECT setval(''seed_%s'', COALESCE((SELECT MAX(code) FROM %I.%I), 0) + 1, false)',
            v_tbl, current_schema(), v_tbl);
    END LOOP;
END
$seq$;

-- -------------------------------------------------------------------------------------
-- 1. Empresa
-- -------------------------------------------------------------------------------------
INSERT INTO company (id, code, legal_name, trade_name, cnpj, email, phone, street, number,
                     district, city, state_code, zip_code, tax_regime, accountant_name, created_by)
VALUES ('d1000000-0000-4000-a000-000000000001', nextval('seed_company'),
        'Demo Indústria e Comércio Ltda', 'Demo Indústria', '11.222.333/0001-81',
        'contato@demo-gesint.test', '(11) 4002-8922', 'Avenida das Nações', '1500',
        'Centro', 'São Paulo', 'SP', '01310-100', 'SIMPLES_NACIONAL', 'Contabilidade Demo ME',
        'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- -------------------------------------------------------------------------------------
-- 2. Departamentos
-- -------------------------------------------------------------------------------------
INSERT INTO department (id, code, company_id, name, cost_center, description, location, email, created_by)
VALUES
 ('d2000000-0000-4000-a000-000000000001', nextval('seed_department'), 'd1000000-0000-4000-a000-000000000001', 'Diretoria',        'CC-100', 'Direção executiva',         'Matriz - 5º andar', 'diretoria@demo-gesint.test',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d2000000-0000-4000-a000-000000000002', nextval('seed_department'), 'd1000000-0000-4000-a000-000000000001', 'Recursos Humanos', 'CC-200', 'Gestão de pessoas e DP',    'Matriz - 3º andar', 'rh@demo-gesint.test',         'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d2000000-0000-4000-a000-000000000003', nextval('seed_department'), 'd1000000-0000-4000-a000-000000000001', 'Financeiro',       'CC-300', 'Contas a pagar e receber',  'Matriz - 3º andar', 'financeiro@demo-gesint.test', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d2000000-0000-4000-a000-000000000004', nextval('seed_department'), 'd1000000-0000-4000-a000-000000000001', 'Tecnologia',       'CC-400', 'Sistemas e infraestrutura', 'Matriz - 4º andar', 'ti@demo-gesint.test',         'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d2000000-0000-4000-a000-000000000005', nextval('seed_department'), 'd1000000-0000-4000-a000-000000000001', 'Operações',        'CC-500', 'Produção e logística',      'Galpão 2',          'operacoes@demo-gesint.test',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- -------------------------------------------------------------------------------------
-- 3. Cargos
-- -------------------------------------------------------------------------------------
INSERT INTO job_position (id, code, department_id, title, cbo_code, description, created_by)
VALUES
 ('d3000000-0000-4000-a000-000000000001', nextval('seed_job_position'), 'd2000000-0000-4000-a000-000000000001', 'Diretor Administrativo',  '1210-05', 'Responde pela operação administrativa',    'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d3000000-0000-4000-a000-000000000002', nextval('seed_job_position'), 'd2000000-0000-4000-a000-000000000002', 'Analista de RH',          '2524-05', 'Recrutamento, seleção e rotinas de DP',    'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d3000000-0000-4000-a000-000000000003', nextval('seed_job_position'), 'd2000000-0000-4000-a000-000000000002', 'Assistente de DP',        '4110-05', 'Apoio às rotinas de departamento pessoal', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d3000000-0000-4000-a000-000000000004', nextval('seed_job_position'), 'd2000000-0000-4000-a000-000000000003', 'Analista Financeiro',     '2522-10', 'Conciliação e fluxo de caixa',             'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d3000000-0000-4000-a000-000000000005', nextval('seed_job_position'), 'd2000000-0000-4000-a000-000000000004', 'Desenvolvedor',           '2124-05', 'Desenvolvimento de sistemas',              'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d3000000-0000-4000-a000-000000000006', nextval('seed_job_position'), 'd2000000-0000-4000-a000-000000000004', 'Analista de Suporte',     '2124-10', 'Atendimento de incidentes',                'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d3000000-0000-4000-a000-000000000007', nextval('seed_job_position'), 'd2000000-0000-4000-a000-000000000005', 'Encarregado de Produção', '9105-05', 'Coordena a linha de produção',             'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d3000000-0000-4000-a000-000000000008', nextval('seed_job_position'), 'd2000000-0000-4000-a000-000000000005', 'Auxiliar de Logística',   '4141-05', 'Movimentação e conferência de materiais',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- -------------------------------------------------------------------------------------
-- 4. Jornada de trabalho (seg a sex, 08:00-12:00 / 13:00-17:00)
-- -------------------------------------------------------------------------------------
INSERT INTO work_schedule (id, code, name, description, created_by)
VALUES ('d4000000-0000-4000-a000-000000000001', nextval('seed_work_schedule'),
        'Administrativo 44h', 'Segunda a sexta, 08:00-12:00 e 13:00-17:00',
        'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

INSERT INTO work_schedule_day (id, work_schedule_id, day_of_week, period1_start, period1_end, period2_start, period2_end)
VALUES
 (gen_random_uuid(), 'd4000000-0000-4000-a000-000000000001', 'MONDAY',    TIME '08:00', TIME '12:00', TIME '13:00', TIME '17:00'),
 (gen_random_uuid(), 'd4000000-0000-4000-a000-000000000001', 'TUESDAY',   TIME '08:00', TIME '12:00', TIME '13:00', TIME '17:00'),
 (gen_random_uuid(), 'd4000000-0000-4000-a000-000000000001', 'WEDNESDAY', TIME '08:00', TIME '12:00', TIME '13:00', TIME '17:00'),
 (gen_random_uuid(), 'd4000000-0000-4000-a000-000000000001', 'THURSDAY',  TIME '08:00', TIME '12:00', TIME '13:00', TIME '17:00'),
 (gen_random_uuid(), 'd4000000-0000-4000-a000-000000000001', 'FRIDAY',    TIME '08:00', TIME '12:00', TIME '13:00', TIME '17:00');

-- -------------------------------------------------------------------------------------
-- 5. Colaboradores  (gender / marital_status: literal puro, ver nota do cabeçalho)
-- -------------------------------------------------------------------------------------
INSERT INTO collaborator (id, code, full_name, cpf, rg, birth_date, gender, marital_status,
                          mother_name, nationality, pis_pasep, created_by)
VALUES
 ('d5000000-0000-4000-a000-000000000001', nextval('seed_collaborator'), 'Ana Beatriz Ferreira',   '111.111.111-11', '11.111.111-1', DATE '1985-03-12', 'FEMALE', 'MARRIED',  'Marta Ferreira',  'Brasileira', '120.11111.11-1', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000002', nextval('seed_collaborator'), 'Bruno Carvalho Lima',    '222.222.222-22', '22.222.222-2', DATE '1990-07-25', 'MALE',   'SINGLE',   'Rosa Carvalho',   'Brasileira', '120.22222.22-2', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000003', nextval('seed_collaborator'), 'Carla Souza Menezes',    '333.333.333-33', '33.333.333-3', DATE '1993-11-02', 'FEMALE', 'SINGLE',   'Ivone Souza',     'Brasileira', '120.33333.33-3', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000004', nextval('seed_collaborator'), 'Diego Almeida Ramos',    '444.444.444-44', '44.444.444-4', DATE '1988-01-30', 'MALE',   'MARRIED',  'Sueli Almeida',   'Brasileira', '120.44444.44-4', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000005', nextval('seed_collaborator'), 'Eduarda Pinto Rocha',    '555.555.555-55', '55.555.555-5', DATE '1996-05-18', 'FEMALE', 'SINGLE',   'Lucia Pinto',     'Brasileira', '120.55555.55-5', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000006', nextval('seed_collaborator'), 'Felipe Nogueira Dias',   '666.666.666-66', '66.666.666-6', DATE '1991-09-09', 'MALE',   'DIVORCED', 'Angela Nogueira', 'Brasileira', '120.66666.66-6', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000007', nextval('seed_collaborator'), 'Gabriela Martins Alves', '777.777.777-77', '77.777.777-7', DATE '1994-12-21', 'FEMALE', 'MARRIED',  'Teresa Martins',  'Brasileira', '120.77777.77-7', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000008', nextval('seed_collaborator'), 'Henrique Barbosa Melo',  '888.888.888-88', '88.888.888-8', DATE '1983-06-14', 'MALE',   'MARRIED',  'Neusa Barbosa',   'Brasileira', '120.88888.88-8', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000009', nextval('seed_collaborator'), 'Isabela Correia Pires',  '999.999.999-99', '99.999.999-9', DATE '1998-02-07', 'FEMALE', 'SINGLE',   'Vera Correia',    'Brasileira', '120.99999.99-9', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d5000000-0000-4000-a000-000000000010', nextval('seed_collaborator'), 'João Pedro Tavares',     '101.010.101-01', '10.101.010-1', DATE '1987-08-28', 'MALE',   'SINGLE',   'Cleide Tavares',  'Brasileira', '120.10101.01-0', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- Endereço: city_id/state_id vêm do catálogo compartilhado, sempre em public.
INSERT INTO collaborator_address (id, code, collaborator_id, zip_code, street, number, district,
                                 state_id, city_id, is_primary, created_by)
SELECT gen_random_uuid(), nextval('seed_collaborator_address'), c.id,
       '01310-100', 'Rua das Acácias', (100 + row_number() OVER (ORDER BY c.code))::text, 'Centro',
       (SELECT id FROM public.state WHERE abbreviation = 'SP' LIMIT 1),
       (SELECT ci.id FROM public.city ci JOIN public.state st ON st.id = ci.state_id
         WHERE st.abbreviation = 'SP' AND ci.name = 'São Paulo' LIMIT 1),
       true, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
FROM collaborator c
WHERE c.created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;

INSERT INTO collaborator_contact (id, code, collaborator_id, email, phone, is_primary, created_by)
SELECT gen_random_uuid(), nextval('seed_collaborator_contact'), c.id,
       lower(translate(split_part(c.full_name, ' ', 1) || '.' || split_part(c.full_name, ' ', 2),
                       'áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ', 'aaaaeeiooouucAAAAEEIOOOUUC')) || '@demo-gesint.test',
       '(11) 9' || lpad((10000000 + c.code)::text, 8, '0'),
       true, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
FROM collaborator c
WHERE c.created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;

-- -------------------------------------------------------------------------------------
-- 6. Contratos de trabalho  (contract_type: literal puro)
-- -------------------------------------------------------------------------------------
INSERT INTO employment_contract (id, code, collaborator_id, company_id, job_position_id,
                                 contract_type, start_date, base_salary, workload_hours, notes, created_by)
VALUES
 ('d6000000-0000-4000-a000-000000000001', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000001', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000001', 'CLT',        (CURRENT_DATE - INTERVAL '6 years')::date,   18500.00, 220, 'Contrato de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000002', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000002', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000002', 'CLT',        (CURRENT_DATE - INTERVAL '4 years')::date,    6200.00, 220, 'Contrato de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000003', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000003', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000003', 'CLT',        (CURRENT_DATE - INTERVAL '2 years')::date,    3100.00, 220, 'Contrato de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000004', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000004', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000004', 'CLT',        (CURRENT_DATE - INTERVAL '5 years')::date,    7400.00, 220, 'Contrato de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000005', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000005', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000005', 'CLT',        (CURRENT_DATE - INTERVAL '3 years')::date,    9800.00, 220, 'Contrato de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000006', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000006', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000005', 'PJ',         (CURRENT_DATE - INTERVAL '18 months')::date, 12500.00, 220, 'Prestador de demonstração', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000007', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000007', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000006', 'CLT',        (CURRENT_DATE - INTERVAL '1 year')::date,     4600.00, 220, 'Contrato de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000008', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000008', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000007', 'CLT',        (CURRENT_DATE - INTERVAL '8 years')::date,    5900.00, 220, 'Contrato de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000009', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000009', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000008', 'APPRENTICE', (CURRENT_DATE - INTERVAL '9 months')::date,   1600.00, 220, 'Aprendiz de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d6000000-0000-4000-a000-000000000010', nextval('seed_employment_contract'), 'd5000000-0000-4000-a000-000000000010', 'd1000000-0000-4000-a000-000000000001', 'd3000000-0000-4000-a000-000000000008', 'CLT',        (CURRENT_DATE - INTERVAL '3 years')::date,    2900.00, 220, 'Contrato de demonstração',  'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- -------------------------------------------------------------------------------------
-- 7. Benefícios
-- -------------------------------------------------------------------------------------
INSERT INTO benefit_plan (id, code, name, benefit_type, monthly_value, description, start_date, created_by)
VALUES
 ('d7000000-0000-4000-a000-000000000001', nextval('seed_benefit_plan'), 'Plano de Saúde Demo',  'HEALTH',    480.00, 'Cobertura ambulatorial e hospitalar', (CURRENT_DATE - INTERVAL '2 years')::date, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d7000000-0000-4000-a000-000000000002', nextval('seed_benefit_plan'), 'Vale Refeição Demo',   'MEAL',      660.00, 'R$ 30,00 por dia útil',               (CURRENT_DATE - INTERVAL '2 years')::date, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d7000000-0000-4000-a000-000000000003', nextval('seed_benefit_plan'), 'Vale Transporte Demo', 'TRANSPORT', 264.00, 'Dois trechos por dia útil',           (CURRENT_DATE - INTERVAL '2 years')::date, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d7000000-0000-4000-a000-000000000004', nextval('seed_benefit_plan'), 'Seguro de Vida Demo',  'INSURANCE',  38.00, 'Cobertura por morte e invalidez',     (CURRENT_DATE - INTERVAL '2 years')::date, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- Saúde e refeição para todos; transporte só para os salários menores.
INSERT INTO benefit_enrollment (id, code, collaborator_id, benefit_plan_id, start_date, monthly_value, created_by)
SELECT gen_random_uuid(), nextval('seed_benefit_enrollment'), x.collaborator_id, x.plan_id,
       (CURRENT_DATE - INTERVAL '1 year')::date, x.valor, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
FROM (
    SELECT c.id AS collaborator_id, p.id AS plan_id, p.monthly_value AS valor, c.code AS ord
    FROM collaborator c
    CROSS JOIN benefit_plan p
    WHERE c.created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
      AND p.id IN ('d7000000-0000-4000-a000-000000000001', 'd7000000-0000-4000-a000-000000000002')
    UNION ALL
    SELECT c.id, 'd7000000-0000-4000-a000-000000000003'::uuid, 264.00, c.code
    FROM collaborator c
    JOIN employment_contract ec ON ec.collaborator_id = c.id
    WHERE c.created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
      AND ec.base_salary < 5000
) AS x;

-- -------------------------------------------------------------------------------------
-- 8. Ponto do mês passado (dias úteis)
-- O índice único (collaborator_id, work_date) impede duplicar por colaborador/dia.
-- -------------------------------------------------------------------------------------
INSERT INTO attendance_record (id, code, collaborator_id, work_date, clock_in, clock_out,
                               break_start, break_end, break_minutes, expected_hours, worked_hours, created_by)
SELECT gen_random_uuid(), nextval('seed_attendance_record'), c.id, d.dia::date,
       TIME '08:00' + (c.code % 3) * INTERVAL '15 minutes',
       TIME '17:00' + (c.code % 3) * INTERVAL '15 minutes',
       TIME '12:00', TIME '13:00', 60, 8.00, 8.00,
       'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
FROM collaborator c
CROSS JOIN generate_series(
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month')::date,
        (date_trunc('month', CURRENT_DATE) - INTERVAL '1 day')::date,
        INTERVAL '1 day') AS d(dia)
WHERE c.created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
  AND EXTRACT(ISODOW FROM d.dia) < 6;

-- -------------------------------------------------------------------------------------
-- 9. Férias e afastamentos  (leave_type: literal puro)
-- -------------------------------------------------------------------------------------
INSERT INTO leave_request (id, code, collaborator_id, leave_type, start_date, end_date, approved,
                           notes, duration_days, created_by)
VALUES
 ('d8100000-0000-4000-a000-000000000001', nextval('seed_leave_request'), 'd5000000-0000-4000-a000-000000000002', 'VACATION',            (CURRENT_DATE + INTERVAL '20 days')::date,  (CURRENT_DATE + INTERVAL '49 days')::date,  true,  'Férias aprovadas — demo',      30, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d8100000-0000-4000-a000-000000000002', nextval('seed_leave_request'), 'd5000000-0000-4000-a000-000000000004', 'VACATION',            (CURRENT_DATE - INTERVAL '90 days')::date,  (CURRENT_DATE - INTERVAL '61 days')::date,  true,  'Férias gozadas — demo',        30, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d8100000-0000-4000-a000-000000000003', nextval('seed_leave_request'), 'd5000000-0000-4000-a000-000000000005', 'MEDICAL_CERTIFICATE', (CURRENT_DATE - INTERVAL '15 days')::date,  (CURRENT_DATE - INTERVAL '13 days')::date,  true,  'Atestado de 3 dias — demo',     3, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d8100000-0000-4000-a000-000000000004', nextval('seed_leave_request'), 'd5000000-0000-4000-a000-000000000007', 'MATERNITY',           (CURRENT_DATE + INTERVAL '10 days')::date,  (CURRENT_DATE + INTERVAL '129 days')::date, false, 'Licença maternidade — demo',  120, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- -------------------------------------------------------------------------------------
-- 10. Folha do mês passado  (payroll_status: literal puro)
-- -------------------------------------------------------------------------------------
INSERT INTO payroll_run (id, code, reference_date, payroll_status, notes, opened_at, created_by)
VALUES ('d8000000-0000-4000-a000-000000000001', nextval('seed_payroll_run'),
        date_trunc('month', CURRENT_DATE - INTERVAL '1 month')::date,
        'CLOSED', 'Folha de demonstração', now() - INTERVAL '35 days',
        'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

INSERT INTO payslip (id, code, payroll_run_id, collaborator_id, base_salary,
                     gross_amount, deductions_amount, net_amount, generated_at, created_by)
SELECT gen_random_uuid(), nextval('seed_payslip'),
       'd8000000-0000-4000-a000-000000000001'::uuid, c.id, ec.base_salary,
       round(ec.base_salary * 1.08, 2), round(ec.base_salary * 0.21, 2), round(ec.base_salary * 0.87, 2),
       now() - INTERVAL '32 days', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
FROM collaborator c
JOIN employment_contract ec ON ec.collaborator_id = c.id
WHERE c.created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;

-- Lançamentos: salário base (provento) + INSS (desconto), usando os eventos do tenant.
INSERT INTO payslip_entry (id, code, payslip_id, payroll_event_id, quantity, unit_value, total_value, created_by)
SELECT gen_random_uuid(), nextval('seed_payslip_entry'), p.id, e.event_id, 1, e.valor, e.valor,
       'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
FROM payslip p
CROSS JOIN LATERAL (
    SELECT 1 AS ord, (SELECT id FROM payroll_event WHERE event_code = 'SAL_BASE' AND status <> 'DELETED' LIMIT 1) AS event_id, p.base_salary AS valor
    UNION ALL
    SELECT 2, (SELECT id FROM payroll_event WHERE event_code = 'INSS' AND status <> 'DELETED' LIMIT 1), round(p.base_salary * 0.11, 2)
) AS e
WHERE p.created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
  AND e.event_id IS NOT NULL;

-- -------------------------------------------------------------------------------------
-- 11. Avaliações de desempenho  (rating: literal puro)
-- -------------------------------------------------------------------------------------
INSERT INTO performance_review (id, code, collaborator_id, period_start, period_end, rating,
                                goals_summary, feedback, reviewer_name, created_by)
VALUES
 ('d8200000-0000-4000-a000-000000000001', nextval('seed_performance_review'), 'd5000000-0000-4000-a000-000000000002', (date_trunc('year', CURRENT_DATE) - INTERVAL '1 year')::date, (date_trunc('year', CURRENT_DATE) - INTERVAL '1 day')::date, 'EXCEEDS',           'Reduzir tempo de fechamento da folha', 'Superou o esperado no ciclo — demo',   'Ana Beatriz Ferreira', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d8200000-0000-4000-a000-000000000002', nextval('seed_performance_review'), 'd5000000-0000-4000-a000-000000000005', (date_trunc('year', CURRENT_DATE) - INTERVAL '1 year')::date, (date_trunc('year', CURRENT_DATE) - INTERVAL '1 day')::date, 'OUTSTANDING',       'Entregar o módulo de integrações',     'Referência técnica do time — demo',   'Ana Beatriz Ferreira', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('d8200000-0000-4000-a000-000000000003', nextval('seed_performance_review'), 'd5000000-0000-4000-a000-000000000010', (date_trunc('year', CURRENT_DATE) - INTERVAL '1 year')::date, (date_trunc('year', CURRENT_DATE) - INTERVAL '1 day')::date, 'NEEDS_IMPROVEMENT', 'Reduzir divergências de inventário',   'Plano de desenvolvimento acordado — demo', 'Ana Beatriz Ferreira', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- -------------------------------------------------------------------------------------
-- 12. Recrutamento
-- -------------------------------------------------------------------------------------
INSERT INTO candidate (id, code, full_name, cpf, created_by)
VALUES
 ('da000000-0000-4000-a000-000000000001', nextval('seed_candidate'), 'Larissa Gomes Duarte',  '121.212.121-21', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('da000000-0000-4000-a000-000000000002', nextval('seed_candidate'), 'Marcos Vinicius Paiva', '131.313.131-31', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('da000000-0000-4000-a000-000000000003', nextval('seed_candidate'), 'Natalia Ribeiro Cunha', '141.414.141-41', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('da000000-0000-4000-a000-000000000004', nextval('seed_candidate'), 'Otavio Freitas Brito',  '151.515.151-51', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

INSERT INTO job_vacancy (id, code, job_title, created_by)
VALUES
 ('db000000-0000-4000-a000-000000000001', nextval('seed_job_vacancy'), 'Desenvolvedor Back-end (demo)', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 ('db000000-0000-4000-a000-000000000002', nextval('seed_job_vacancy'), 'Analista de DP (demo)',         'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

INSERT INTO job_vacancy_application (id, code, job_vacancy_id, candidate_id, created_by)
VALUES
 (gen_random_uuid(), nextval('seed_job_vacancy_application'), 'db000000-0000-4000-a000-000000000001', 'da000000-0000-4000-a000-000000000001', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 (gen_random_uuid(), nextval('seed_job_vacancy_application'), 'db000000-0000-4000-a000-000000000001', 'da000000-0000-4000-a000-000000000002', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 (gen_random_uuid(), nextval('seed_job_vacancy_application'), 'db000000-0000-4000-a000-000000000002', 'da000000-0000-4000-a000-000000000003', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
 (gen_random_uuid(), nextval('seed_job_vacancy_application'), 'db000000-0000-4000-a000-000000000002', 'da000000-0000-4000-a000-000000000004', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- -------------------------------------------------------------------------------------
-- Resumo do que entrou
-- -------------------------------------------------------------------------------------
DO $resumo$
DECLARE
    v_marker uuid := 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    v_tbl text;
    v_n integer;
BEGIN
    RAISE NOTICE '--- inseridas no schema "%" ---', current_schema();
    FOREACH v_tbl IN ARRAY ARRAY['company','department','job_position','work_schedule','collaborator',
                                 'collaborator_address','collaborator_contact','employment_contract',
                                 'benefit_plan','benefit_enrollment','attendance_record','leave_request',
                                 'payroll_run','payslip','payslip_entry','performance_review',
                                 'candidate','job_vacancy','job_vacancy_application']
    LOOP
        EXECUTE format('SELECT count(*) FROM %I.%I WHERE created_by = $1', current_schema(), v_tbl)
            INTO v_n USING v_marker;
        RAISE NOTICE '  % %', rpad(v_tbl, 26), v_n;
    END LOOP;
    EXECUTE format('SELECT count(*) FROM %I.work_schedule_day WHERE work_schedule_id = $1', current_schema())
        INTO v_n USING 'd4000000-0000-4000-a000-000000000001'::uuid;
    RAISE NOTICE '  % %', rpad('work_schedule_day', 26), v_n;
END
$resumo$;

COMMIT;
