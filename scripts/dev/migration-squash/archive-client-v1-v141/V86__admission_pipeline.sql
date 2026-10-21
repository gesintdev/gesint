-- Esteira de Admissao: as seis etapas entre a contratacao e o primeiro dia.
-- Base normativa citada na especificacao funcional (24 ago 2026): NR-7 (exame
-- admissional antes do inicio das atividades), CLT art. 29 (registro em 5 dias
-- uteis), eSocial S-2200 (vespera do inicio), NR-1 / NR-6 (integracao).
-- esocial_event nasce apenas como controle de status e prazo: nao ha transmissao
-- nesta migration, e o consumidor do certificado A1 (V85) fica para depois.
-- Enums novos nascem em gesint_types (padrao apos V79).

CREATE TYPE gesint_types.admission_step_key_enum AS ENUM (
    'DOCUMENTACAO',
    'EXAME',
    'CONTRATO',
    'REGISTRO',
    'ESOCIAL',
    'INTEGRACAO'
);

CREATE TYPE gesint_types.admission_step_status_enum AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'BLOCKED',
    'DONE',
    'SKIPPED'
);

CREATE TYPE gesint_types.esocial_event_type_enum AS ENUM (
    'S_2200',
    'S_2206',
    'S_2230',
    'S_2299'
);

CREATE TYPE gesint_types.esocial_event_status_enum AS ENUM (
    'NAO_GERADO',
    'GERADO',
    'TRANSMITIDO',
    'ACEITO',
    'REJEITADO'
);

CREATE TABLE IF NOT EXISTS admission_step (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                INTEGER NOT NULL UNIQUE,
    status              gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    admission_id        UUID NOT NULL REFERENCES admission_process (id) ON DELETE CASCADE,
    step_key            gesint_types.admission_step_key_enum NOT NULL,
    step_status         gesint_types.admission_step_status_enum NOT NULL DEFAULT 'PENDING',
    display_order       INT NOT NULL,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    completed_by        UUID,
    due_date            DATE,
    blocked_reason      TEXT,
    skip_justification  TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ,
    CONSTRAINT ck_admission_step_skip_justified
        CHECK (step_status <> 'SKIPPED' OR skip_justification IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_admission_step_admission_key
    ON admission_step (admission_id, step_key);

CREATE INDEX IF NOT EXISTS idx_admission_step_due_date
    ON admission_step (due_date)
    WHERE status != 'DELETED' AND due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admission_step_status
    ON admission_step (step_status)
    WHERE status != 'DELETED';

-- admission_id e collaborator_id sao nullable: a tabela tambem servira a eventos
-- que nao nascem de uma admissao (S-2206, S-2230, S-2299).
CREATE TABLE IF NOT EXISTS esocial_event (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    admission_id    UUID REFERENCES admission_process (id),
    collaborator_id UUID REFERENCES collaborator (id),
    event_type      gesint_types.esocial_event_type_enum NOT NULL,
    event_status    gesint_types.esocial_event_status_enum NOT NULL DEFAULT 'NAO_GERADO',
    due_date        DATE,
    transmitted_at  TIMESTAMPTZ,
    receipt_number  VARCHAR(60),
    errors          JSONB,
    payload         JSONB,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_esocial_event_admission_type
    ON esocial_event (admission_id, event_type)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_esocial_event_due_date
    ON esocial_event (due_date)
    WHERE status != 'DELETED' AND due_date IS NOT NULL;

-- Campos exigidos pelo leiaute do S-2200 e ainda ausentes do cadastro.
-- Todos nullable: entram no schema agora, na tela depois.
ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS blocked_reason    TEXT,
    ADD COLUMN IF NOT EXISTS race_color        VARCHAR(30),
    ADD COLUMN IF NOT EXISTS education_level   VARCHAR(30),
    ADD COLUMN IF NOT EXISTS birth_city_id     UUID REFERENCES city (id),
    ADD COLUMN IF NOT EXISTS birth_country     VARCHAR(60),
    ADD COLUMN IF NOT EXISTS disability_info   JSONB,
    ADD COLUMN IF NOT EXISTS worker_category   VARCHAR(10),
    ADD COLUMN IF NOT EXISTS activity_nature   VARCHAR(20),
    ADD COLUMN IF NOT EXISTS establishment_id  UUID,
    ADD COLUMN IF NOT EXISTS union_cnpj        VARCHAR(14),
    ADD COLUMN IF NOT EXISTS bank_account      JSONB;

-- Backfill: toda admissao viva ganha as seis etapas em PENDING. O status real e
-- derivado das evidencias (anexos, ASO, contrato, evento) pelo servico da esteira.
INSERT INTO admission_step (code, admission_id, step_key, display_order)
SELECT
    row_number() OVER (ORDER BY a.created_at, a.id, s.display_order),
    a.id,
    s.step_key,
    s.display_order
FROM admission_process a
CROSS JOIN (
    VALUES
        ('DOCUMENTACAO'::gesint_types.admission_step_key_enum, 1),
        ('EXAME', 2),
        ('CONTRATO', 3),
        ('REGISTRO', 4),
        ('ESOCIAL', 5),
        ('INTEGRACAO', 6)
) AS s (step_key, display_order)
WHERE a.status <> 'DELETED'
ON CONFLICT (admission_id, step_key) DO NOTHING;

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('20000000-0000-0000-0000-000000000103', 9911, 'admission', 'admission:pipeline', 'Acompanhar a esteira de admissao (prazos legais, travas e bloqueios)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE authority = 'admission:pipeline'
ON CONFLICT DO NOTHING;

-- Perfil HR operacional acompanha a esteira (leitura); nao ganha nada clinico.
INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permission
WHERE authority = 'admission:pipeline'
ON CONFLICT DO NOTHING;

-- Espelha tabelas, colunas, backfill e permissoes nos schemas tenant_* existentes.
DO $sync_admission_pipeline$
DECLARE
    target_schema text;
    tbl text;
    tables text[] := ARRAY['admission_step', 'esocial_event'];
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.admission_process', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format(
            $sql$
            ALTER TABLE %I.admission_process
                ADD COLUMN IF NOT EXISTS blocked_reason    TEXT,
                ADD COLUMN IF NOT EXISTS race_color        VARCHAR(30),
                ADD COLUMN IF NOT EXISTS education_level   VARCHAR(30),
                ADD COLUMN IF NOT EXISTS birth_city_id     UUID,
                ADD COLUMN IF NOT EXISTS birth_country     VARCHAR(60),
                ADD COLUMN IF NOT EXISTS disability_info   JSONB,
                ADD COLUMN IF NOT EXISTS worker_category   VARCHAR(10),
                ADD COLUMN IF NOT EXISTS activity_nature   VARCHAR(20),
                ADD COLUMN IF NOT EXISTS establishment_id  UUID,
                ADD COLUMN IF NOT EXISTS union_cnpj        VARCHAR(14),
                ADD COLUMN IF NOT EXISTS bank_account      JSONB
            $sql$,
            target_schema
        );

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

        EXECUTE format(
            $sql$
            INSERT INTO %I.admission_step (code, admission_id, step_key, display_order)
            SELECT
                row_number() OVER (ORDER BY a.created_at, a.id, s.display_order),
                a.id,
                s.step_key,
                s.display_order
            FROM %I.admission_process a
            CROSS JOIN (
                VALUES
                    ('DOCUMENTACAO'::gesint_types.admission_step_key_enum, 1),
                    ('EXAME', 2),
                    ('CONTRATO', 3),
                    ('REGISTRO', 4),
                    ('ESOCIAL', 5),
                    ('INTEGRACAO', 6)
            ) AS s (step_key, display_order)
            WHERE a.status <> 'DELETED'
            ON CONFLICT (admission_id, step_key) DO NOTHING
            $sql$,
            target_schema,
            target_schema
        );

        IF to_regclass(format('%I.permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.permission (id, code, authority, module, description)
                SELECT p.id, p.code, p.authority, p.module, p.description
                FROM public.permission p
                WHERE p.authority = 'admission:pipeline'
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
                WHERE p.authority = 'admission:pipeline'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_admission_pipeline$;
