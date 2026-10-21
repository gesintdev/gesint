-- RN-32: pagina de carreiras do tenant (tema + blocos) editada em CFG.
--   careers_page        : uma por tenant. As colunas sao o rascunho; published_snapshot e o que a
--                         pagina publica exibe. Sem snapshot, /careers usa o layout padrao do Gesint.
--   careers_page_block  : blocos do rascunho (padrao do sistema ou proprios do cliente).
-- RN-33 / SEG-04: candidatura publica sem CPF e com dois consentimentos (processo e banco de
-- talentos), guardando data e versao do aviso de privacidade.

CREATE TABLE IF NOT EXISTS careers_page (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL UNIQUE,
    status                      gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    display_name                VARCHAR(200),
    logo_object_id              UUID,
    primary_color               VARCHAR(7),
    accent_color                VARCHAR(7),
    font_style                  VARCHAR(16) NOT NULL DEFAULT 'MODERN',
    corner_style                VARCHAR(16) NOT NULL DEFAULT 'ROUNDED',
    show_salary                 BOOLEAN NOT NULL DEFAULT true,
    seo_title                   VARCHAR(70),
    seo_description             VARCHAR(160),
    social_links                JSONB NOT NULL DEFAULT '{}'::jsonb,
    privacy_notice              TEXT,
    privacy_notice_version      INTEGER NOT NULL DEFAULT 1,
    talent_pool_months          INTEGER NOT NULL DEFAULT 12,
    draft_revision              INTEGER NOT NULL DEFAULT 1,
    published_revision          INTEGER,
    published_snapshot          JSONB,
    published_at                TIMESTAMPTZ,
    published_by                UUID,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS careers_page_block (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL UNIQUE,
    status                      gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    page_id                     UUID NOT NULL REFERENCES careers_page (id),
    block_type                  VARCHAR(32) NOT NULL,
    title                       VARCHAR(200),
    subtitle                    VARCHAR(400),
    content                     JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order               INTEGER NOT NULL DEFAULT 0,
    visible                     BOOLEAN NOT NULL DEFAULT true,
    system_block                BOOLEAN NOT NULL DEFAULT false,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_careers_page_block_page
    ON careers_page_block (page_id, display_order)
    WHERE status <> 'DELETED';

ALTER TABLE candidate ALTER COLUMN cpf DROP NOT NULL;

ALTER TABLE job_vacancy_application
    ADD COLUMN IF NOT EXISTS privacy_consent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS privacy_consent_version VARCHAR(40),
    ADD COLUMN IF NOT EXISTS talent_pool_consent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS talent_pool_consent_version VARCHAR(40),
    ADD COLUMN IF NOT EXISTS talent_pool_consent_until DATE,
    ADD COLUMN IF NOT EXISTS applicant_snapshot JSONB;

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('57000000-0000-0000-0000-000000000001', 10071, 'careerspage', 'careerspage:read', 'Visualizar a página de carreiras'),
    ('57000000-0000-0000-0000-000000000002', 10072, 'careerspage', 'careerspage:write', 'Editar e publicar a página de carreiras')
ON CONFLICT DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'careerspage'
ON CONFLICT DO NOTHING;

-- Quem ja publicava vagas passa a cuidar da pagina de carreiras.
INSERT INTO role_permission (role_id, permission_id)
SELECT DISTINCT rp.role_id, target.id
FROM role_permission rp
INNER JOIN permission source ON source.id = rp.permission_id
    AND source.authority = 'jobvacancy:write'
CROSS JOIN permission target
WHERE target.module = 'careerspage'
ON CONFLICT DO NOTHING;

SELECT public.gesint_sync_admin_profile_permissions();

DO $sync_careers_page$
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
        IF to_regclass(format('%I.job_vacancy', target_schema)) IS NOT NULL THEN
            IF to_regclass(format('%I.careers_page', target_schema)) IS NULL THEN
                EXECUTE format(
                    'CREATE TABLE %I.careers_page (LIKE public.careers_page INCLUDING ALL)',
                    target_schema);
            END IF;
            IF to_regclass(format('%I.careers_page_block', target_schema)) IS NULL THEN
                EXECUTE format(
                    'CREATE TABLE %I.careers_page_block (LIKE public.careers_page_block INCLUDING ALL)',
                    target_schema);
            END IF;
        END IF;

        IF to_regclass(format('%I.candidate', target_schema)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I.candidate ALTER COLUMN cpf DROP NOT NULL', target_schema);
        END IF;

        IF to_regclass(format('%I.job_vacancy_application', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.job_vacancy_application '
                || 'ADD COLUMN IF NOT EXISTS privacy_consent_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS privacy_consent_version VARCHAR(40), '
                || 'ADD COLUMN IF NOT EXISTS talent_pool_consent_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS talent_pool_consent_version VARCHAR(40), '
                || 'ADD COLUMN IF NOT EXISTS talent_pool_consent_until DATE, '
                || 'ADD COLUMN IF NOT EXISTS applicant_snapshot JSONB',
                target_schema);
        END IF;

        EXECUTE format(
            $sql$
            INSERT INTO %I.permission (id, code, authority, module, description)
            SELECT p.id, p.code, p.authority, p.module, p.description
            FROM public.permission p
            WHERE p.module = 'careerspage'
            ON CONFLICT DO NOTHING
            $sql$,
            target_schema);

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.module = 'careerspage'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema);

            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT DISTINCT rp.role_id, target.id
                FROM %I.role_permission rp
                INNER JOIN %I.permission source ON source.id = rp.permission_id
                    AND source.authority = 'jobvacancy:write'
                CROSS JOIN %I.permission target
                WHERE target.module = 'careerspage'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema,
                target_schema,
                target_schema);
        END IF;
    END LOOP;
END
$sync_careers_page$;

SELECT public.gesint_audit_sync_table('careers_page');
SELECT public.gesint_audit_sync_table('careers_page_block');
SELECT public.gesint_audit_sync_table('candidate');
SELECT public.gesint_audit_sync_table('job_vacancy_application');
