-- Cadastro de certificados digitais A1 por tenant (preparacao eSocial Fase 3).
-- O certificado e do empregador (cliente), nunca da plataforma Gesint.

CREATE TYPE gesint_types.digital_certificate_type_enum AS ENUM (
    'A1'
);

CREATE TYPE gesint_types.digital_certificate_purpose_enum AS ENUM (
    'ESOCIAL',
    'GENERAL'
);

CREATE TYPE gesint_types.digital_certificate_environment_enum AS ENUM (
    'HOMOLOGATION',
    'PRODUCTION'
);

CREATE TABLE IF NOT EXISTS digital_certificate (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                        INTEGER NOT NULL UNIQUE,
    status                      gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    alias                       VARCHAR(120) NOT NULL,
    certificate_type            gesint_types.digital_certificate_type_enum NOT NULL DEFAULT 'A1',
    purpose                     gesint_types.digital_certificate_purpose_enum NOT NULL DEFAULT 'ESOCIAL',
    environment                 gesint_types.digital_certificate_environment_enum NOT NULL DEFAULT 'HOMOLOGATION',
    owner_document              VARCHAR(20),
    subject_name                VARCHAR(255),
    issuer_name                 VARCHAR(255),
    serial_number               VARCHAR(100),
    thumbprint                  VARCHAR(128),
    valid_from                  TIMESTAMPTZ,
    valid_until                 TIMESTAMPTZ,
    is_default                  BOOLEAN NOT NULL DEFAULT false,
    pkcs12_encrypted            BYTEA NOT NULL,
    password_encrypted          BYTEA NOT NULL,
    created_by                  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                  UUID,
    updated_at                  TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_digital_certificate_thumbprint_active
    ON digital_certificate (thumbprint)
    WHERE status != 'DELETED' AND thumbprint IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_digital_certificate_default
    ON digital_certificate (is_default)
    WHERE status != 'DELETED' AND is_default = true;

CREATE INDEX IF NOT EXISTS idx_digital_certificate_valid_until
    ON digital_certificate (valid_until)
    WHERE status != 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('51000000-0000-0000-0000-000000000001', 9951, 'digitalcertificate', 'digitalcertificate:read', 'Visualizar certificados digitais do empregador'),
    ('51000000-0000-0000-0000-000000000002', 9952, 'digitalcertificate', 'digitalcertificate:write', 'Cadastrar e editar certificados digitais'),
    ('51000000-0000-0000-0000-000000000003', 9953, 'digitalcertificate', 'digitalcertificate:delete', 'Excluir certificados digitais')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'digitalcertificate'
ON CONFLICT DO NOTHING;

DO $sync_digital_certificate$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.digital_certificate', target_schema)) IS NULL
           AND to_regclass('public.digital_certificate') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.digital_certificate (LIKE public.digital_certificate INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.permission (id, code, authority, module, description)
                SELECT p.id, p.code, p.authority, p.module, p.description
                FROM public.permission p
                WHERE p.module = 'digitalcertificate'
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
                WHERE p.module = 'digitalcertificate'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_digital_certificate$;
