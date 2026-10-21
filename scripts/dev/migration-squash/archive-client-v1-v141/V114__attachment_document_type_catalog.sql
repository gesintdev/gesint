-- Catalogo de tipos de documento para anexos (SEG-01 · D5 / RN-02).
-- Classe do dado (comum, pessoal, sensivel, financeiro) definida no tipo;
-- o valor type_code continua sendo o que storage_object_link.document_type guarda.

CREATE TYPE gesint_types.document_data_class_enum AS ENUM (
    'COMUM',
    'PESSOAL',
    'SENSIVEL',
    'FINANCEIRO'
);

CREATE TABLE IF NOT EXISTS document_type (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    type_code       VARCHAR(64) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    data_class      gesint_types.document_data_class_enum NOT NULL DEFAULT 'COMUM',
    contexts        JSONB NOT NULL DEFAULT '[]'::jsonb,
    system_managed  BOOLEAN NOT NULL DEFAULT false,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_document_type_type_code_active
    ON document_type (LOWER(type_code))
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_document_type_contexts
    ON document_type USING GIN (contexts);

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('52000000-0000-0000-0000-000000000001', 9961, 'documenttype', 'documenttype:read', 'Visualizar tipos de documento'),
    ('52000000-0000-0000-0000-000000000002', 9962, 'documenttype', 'documenttype:write', 'Cadastrar e editar tipos de documento'),
    ('52000000-0000-0000-0000-000000000003', 9963, 'documenttype', 'documenttype:delete', 'Excluir tipos de documento')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'documenttype'
ON CONFLICT DO NOTHING;

-- Normaliza alias legado OTHER → OUTRO (entrevista de desligamento).
UPDATE storage_object_link
SET document_type = 'OUTRO'
WHERE document_type = 'OTHER';

INSERT INTO document_type (
    id, code, status, type_code, name, description, data_class, contexts, system_managed, sort_order
)
SELECT v.id::uuid, v.code::integer, 'ACTIVE', v.type_code, v.name, v.description,
       v.data_class::gesint_types.document_data_class_enum,
       v.contexts::jsonb, true, v.sort_order::integer
FROM (VALUES
    -- Admissao · documentos pessoais
    ('53000000-0000-0000-0000-000000000001', 1,  'RG',                      'RG',                                 'Documento de identidade',                          'PESSOAL',   '["ADMISSION_DOCUMENT"]', 10),
    ('53000000-0000-0000-0000-000000000002', 2,  'CPF',                     'CPF',                                'Cadastro de Pessoa Fisica',                        'PESSOAL',   '["ADMISSION_DOCUMENT"]', 20),
    ('53000000-0000-0000-0000-000000000003', 3,  'COMPROVANTE_ENDERECO',    'Comprovante de Endereço',            'Comprovante de residencia',                        'PESSOAL',   '["ADMISSION_DOCUMENT"]', 30),
    ('53000000-0000-0000-0000-000000000004', 4,  'CTPS',                    'CTPS',                               'Carteira de Trabalho',                             'PESSOAL',   '["ADMISSION_DOCUMENT"]', 40),
    ('53000000-0000-0000-0000-000000000005', 5,  'TITULO_ELEITOR',          'Título de Eleitor',                  'Titulo eleitoral',                                 'PESSOAL',   '["ADMISSION_DOCUMENT"]', 50),
    ('53000000-0000-0000-0000-000000000006', 6,  'CERTIDAO_NASCIMENTO',     'Certidão de Nascimento/Casamento',   'Certidao civil',                                   'PESSOAL',   '["ADMISSION_DOCUMENT"]', 60),
    ('53000000-0000-0000-0000-000000000007', 7,  'COMPROVANTE_ESCOLARIDADE','Comprovante de Escolaridade',        'Comprovante de escolaridade',                      'PESSOAL',   '["ADMISSION_DOCUMENT"]', 70),

    -- Admissao · contrato CLT / PJ
    ('53000000-0000-0000-0000-000000000010', 10, 'CONTRATO_ASSINADO',       'Contrato assinado',                  'Contrato de trabalho assinado',                    'COMUM',     '["ADMISSION_CONTRACT","ADMISSION_CONTRACT_PJ"]', 100),
    ('53000000-0000-0000-0000-000000000011', 11, 'ADITIVO',                 'Aditivo contratual',                 'Aditivo ao contrato',                              'COMUM',     '["ADMISSION_CONTRACT"]', 110),
    ('53000000-0000-0000-0000-000000000012', 12, 'TERMO_CONFIDENCIALIDADE', 'Termo de confidencialidade',         'NDA / confidencialidade',                          'COMUM',     '["ADMISSION_CONTRACT","ADMISSION_CONTRACT_PJ"]', 120),
    ('53000000-0000-0000-0000-000000000013', 13, 'CONTRATO_PRESTACAO',      'Contrato de prestação de serviços',  'Contrato PJ',                                      'COMUM',     '["ADMISSION_CONTRACT_PJ"]', 130),
    ('53000000-0000-0000-0000-000000000014', 14, 'CARTAO_CNPJ',             'Cartão CNPJ',                        'Comprovante CNPJ',                                 'COMUM',     '["ADMISSION_CONTRACT_PJ"]', 140),

    -- Exame ocupacional
    ('53000000-0000-0000-0000-000000000020', 20, 'ASO',                     'ASO',                                'Atestado de Saude Ocupacional',                    'SENSIVEL',  '["OCCUPATIONAL_EXAM"]', 200),
    ('53000000-0000-0000-0000-000000000021', 21, 'COMPLEMENTARY_EXAM_REPORT','Laudo de exame complementar',        'Laudo de exame complementar',                      'SENSIVEL',  '["OCCUPATIONAL_EXAM"]', 210),

    -- Entrevista de desligamento
    ('53000000-0000-0000-0000-000000000030', 30, 'TERMINATION_TERM',        'Termo de desligamento',              'Termo de desligamento',                            'COMUM',     '["EXIT_INTERVIEW"]', 300),
    ('53000000-0000-0000-0000-000000000031', 31, 'SIGNED_INTERVIEW',        'Entrevista assinada',                'Entrevista de desligamento assinada',              'PESSOAL',   '["EXIT_INTERVIEW"]', 310),
    ('53000000-0000-0000-0000-000000000032', 32, 'PJ_CONTRACT_TERMINATION', 'Distrato/encerramento PJ',           'Distrato ou encerramento de contrato PJ',          'COMUM',     '["EXIT_INTERVIEW"]', 320),
    ('53000000-0000-0000-0000-000000000033', 33, 'RETURN_PROOF',            'Comprovante de devolução',           'Comprovante de devolucao de itens',                'COMUM',     '["EXIT_INTERVIEW"]', 330),

    -- Afastamento (SEG-01 mock: Formulario / Atestado)
    ('53000000-0000-0000-0000-000000000040', 40, 'FORMULARIO',              'Formulário',                         'Formulario ou requerimento operacional',           'COMUM',     '["LEAVE"]', 400),
    ('53000000-0000-0000-0000-000000000041', 41, 'ATESTADO',                'Atestado',                           'Atestado medico ou documento de saude',            'SENSIVEL',  '["LEAVE"]', 410),

    -- Ponto / candidato
    ('53000000-0000-0000-0000-000000000050', 50, 'CLOCK_SELFIE',            'Selfie de ponto',                    'Foto de batida de ponto',                          'PESSOAL',   '["ATTENDANCE"]', 500),
    ('53000000-0000-0000-0000-000000000051', 51, 'CURRICULUM',              'Currículo',                          'Curriculo do candidato',                           'PESSOAL',   '["CANDIDATE"]', 510),

    -- Generico (substitui OUTRO / OTHER)
    ('53000000-0000-0000-0000-000000000090', 90, 'OUTRO',                   'Outro',                              'Outro documento',                                  'COMUM',     '["ADMISSION_DOCUMENT","ADMISSION_CONTRACT","ADMISSION_CONTRACT_PJ","EXIT_INTERVIEW","LEAVE","GENERAL"]', 900)
) AS v(id, code, type_code, name, description, data_class, contexts, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM document_type d
    WHERE LOWER(d.type_code) = LOWER(v.type_code) AND d.status != 'DELETED'
);

CREATE OR REPLACE FUNCTION public.gesint_admin_profile_modules(p_system gesint_types.system_scope_enum)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE p_system
        WHEN 'CFG' THEN ARRAY[
            'role', 'actingprofile', 'user', 'workschedule', 'digitalcertificate', 'documenttype',
            'admission', 'exitinterview', 'developmentplanconfig', 'attendance', 'notification']
        WHEN 'DP' THEN ARRAY[
            'company', 'department', 'jobposition', 'workschedule', 'payment', 'collaborator',
            'admission', 'offboarding', 'occupationalexam', 'notification', 'agenda',
            'attendance', 'leave', 'storage']
        WHEN 'CONTABILIDADE' THEN ARRAY[
            'payroll', 'payrollevent', 'payslip', 'benefit', 'benefitenrollment', 'tax',
            'notification', 'agenda', 'storage']
        WHEN 'RH' THEN ARRAY[
            'collaborator', 'admission', 'exitinterview', 'contract', 'leave', 'performance',
            'jobvacancy', 'candidate', 'jobvacancyapplication', 'developmentplan',
            'notification', 'agenda', 'storage']
        ELSE ARRAY[]::text[]
    END;
$$;

SELECT public.gesint_sync_admin_profile_permissions();

DO $sync_document_type$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.document_type', target_schema)) IS NULL
           AND to_regclass('public.document_type') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.document_type (LIKE public.document_type INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.document_type', target_schema)) IS NOT NULL
           AND to_regclass('public.document_type') IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.document_type (
                    id, code, status, type_code, name, description, data_class,
                    contexts, system_managed, sort_order, created_at
                )
                SELECT
                    p.id, p.code, p.status, p.type_code, p.name, p.description, p.data_class,
                    p.contexts, p.system_managed, p.sort_order, now()
                FROM public.document_type p
                WHERE p.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1 FROM %I.document_type t
                      WHERE LOWER(t.type_code) = LOWER(p.type_code) AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );

            EXECUTE format(
                $sql$
                UPDATE %I.storage_object_link
                SET document_type = 'OUTRO'
                WHERE document_type = 'OTHER'
                $sql$,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.permission (id, code, authority, module, description)
                SELECT p.id, p.code, p.authority, p.module, p.description
                FROM public.permission p
                WHERE p.module = 'documenttype'
                ON CONFLICT (id) DO NOTHING
                $sql$,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.module = 'documenttype'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_document_type$;
