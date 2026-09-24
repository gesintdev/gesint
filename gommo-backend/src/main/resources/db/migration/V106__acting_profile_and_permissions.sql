-- Perfis de atuacao (abrangencia de dados) + permissions CFG.

CREATE TYPE gommo_types.data_scope_enum AS ENUM (
    'ALL',
    'DEPARTMENT',
    'TEAM',
    'ASSIGNED',
    'SELF'
);

CREATE TABLE IF NOT EXISTS acting_profile (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    name            VARCHAR(80) NOT NULL,
    description     VARCHAR(500),
    system          gommo_types.system_scope_enum NOT NULL,
    data_scope      gommo_types.data_scope_enum NOT NULL DEFAULT 'ALL',
    scope_ref       UUID,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_acting_profile_name_system_active
    ON acting_profile (lower(name), system)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_acting_profile_system
    ON acting_profile (system)
    WHERE status != 'DELETED';

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('52000000-0000-0000-0000-000000000001', 9961, 'actingprofile', 'actingprofile:read', 'Visualizar perfis de atuacao'),
    ('52000000-0000-0000-0000-000000000002', 9962, 'actingprofile', 'actingprofile:write', 'Cadastrar e editar perfis de atuacao'),
    ('52000000-0000-0000-0000-000000000003', 9963, 'actingprofile', 'actingprofile:delete', 'Excluir perfis de atuacao')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permission
WHERE module = 'actingprofile'
ON CONFLICT DO NOTHING;

-- Espelha PermissionModuleCatalog CFG (inclui actingprofile).
CREATE OR REPLACE FUNCTION public.gommo_admin_profile_modules(p_system gommo_types.system_scope_enum)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE p_system
        WHEN 'CFG' THEN ARRAY[
            'role', 'actingprofile', 'user', 'workschedule', 'admission', 'exitinterview',
            'developmentplanconfig', 'attendance', 'notification']
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

SELECT public.gommo_sync_admin_profile_permissions();

DO $sync_acting_profile$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.acting_profile', target_schema)) IS NULL
           AND to_regclass('public.acting_profile') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.acting_profile (LIKE public.acting_profile INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.permission (id, code, authority, module, description)
                SELECT p.id, p.code, p.authority, p.module, p.description
                FROM public.permission p
                WHERE p.module = 'actingprofile'
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
                WHERE p.module = 'actingprofile'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_acting_profile$;
