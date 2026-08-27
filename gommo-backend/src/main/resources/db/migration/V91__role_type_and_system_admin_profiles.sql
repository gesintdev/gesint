-- Tipos de perfil:
--   GLOBAL_ADMIN : acesso total a todos os sistemas (usuario de primeiro acesso do cliente)
--   ADMIN        : acesso total dentro de um unico sistema (um por sistema, imutavel)
--   INTERNAL     : perfis tecnicos da plataforma (HR, MOBILE, SESMT) que nao aparecem na listagem
--   CUSTOM       : perfis criados pelo cliente

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'gommo_types' AND t.typname = 'role_type_enum'
    ) THEN
        CREATE TYPE gommo_types.role_type_enum AS ENUM ('GLOBAL_ADMIN', 'ADMIN', 'INTERNAL', 'CUSTOM');
    END IF;
END $$;

ALTER TABLE role
    ADD COLUMN IF NOT EXISTS role_type gommo_types.role_type_enum NOT NULL DEFAULT 'CUSTOM';

UPDATE role SET role_type = 'GLOBAL_ADMIN'
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE role SET role_type = 'INTERNAL'
WHERE is_system = true AND id <> '00000000-0000-0000-0000-000000000001';

CREATE INDEX IF NOT EXISTS idx_role_type_system ON role (role_type, system);

-- Modulos de permissao de cada sistema. Espelha PermissionModuleCatalog no backend; qualquer
-- alteracao la precisa ser refletida aqui.
CREATE OR REPLACE FUNCTION public.gommo_admin_profile_modules(p_system gommo_types.system_scope_enum)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE p_system
        WHEN 'CFG' THEN ARRAY[
            'role', 'user', 'workschedule', 'admission', 'exitinterview',
            'developmentplanconfig', 'attendance', 'notification']
        WHEN 'DP' THEN ARRAY[
            'company', 'department', 'jobposition', 'workschedule', 'payment', 'collaborator',
            'admission', 'offboarding', 'notification', 'agenda', 'attendance', 'leave', 'storage']
        WHEN 'CONTABILIDADE' THEN ARRAY[
            'payroll', 'payrollevent', 'payslip', 'benefit', 'benefitenrollment', 'tax',
            'notification', 'agenda', 'storage']
        WHEN 'RH' THEN ARRAY[
            'collaborator', 'admission', 'exitinterview', 'contract', 'leave', 'performance',
            'jobvacancy', 'candidate', 'jobvacancyapplication', 'developmentplan',
            'occupationalexam', 'notification', 'agenda', 'storage']
        ELSE ARRAY[]::text[]
    END;
$$;

-- Concede a cada perfil ADMIN todas as permissoes do seu sistema. Migrations que adicionam
-- permissoes novas devem chamar esta funcao no final para manter os perfis completos.
CREATE OR REPLACE FUNCTION public.gommo_sync_admin_profile_permissions()
RETURNS void
LANGUAGE sql
AS $$
    INSERT INTO role_permission (role_id, permission_id)
    SELECT r.id, p.id
    FROM role r
    JOIN permission p ON p.module = ANY (public.gommo_admin_profile_modules(r.system))
    WHERE r.role_type = 'ADMIN'
    ON CONFLICT DO NOTHING;
$$;

WITH admin_profiles(id, system, name, description) AS (
    VALUES
        ('00000000-0000-0000-0000-000000000101'::uuid, 'DP'::gommo_types.system_scope_enum,
            'Administrador DP', 'Acesso total ao sistema de Departamento Pessoal'),
        ('00000000-0000-0000-0000-000000000102'::uuid, 'RH'::gommo_types.system_scope_enum,
            'Administrador RH', 'Acesso total ao sistema de Recursos Humanos'),
        ('00000000-0000-0000-0000-000000000103'::uuid, 'CONTABILIDADE'::gommo_types.system_scope_enum,
            'Administrador Contabilidade', 'Acesso total ao sistema de Contabilidade'),
        ('00000000-0000-0000-0000-000000000104'::uuid, 'CFG'::gommo_types.system_scope_enum,
            'Administrador Configurações', 'Acesso total ao sistema de Configurações')
)
INSERT INTO role (id, code, name, description, system, status, is_system, role_type, created_at)
SELECT
    a.id,
    COALESCE((SELECT MAX(code) FROM role), 0) + ROW_NUMBER() OVER (ORDER BY a.name),
    a.name,
    a.description,
    a.system,
    'ACTIVE',
    true,
    'ADMIN',
    now()
FROM admin_profiles a
WHERE NOT EXISTS (SELECT 1 FROM role r WHERE r.id = a.id);

SELECT public.gommo_sync_admin_profile_permissions();

-- Escala de trabalho padrao usada como semente dos tenants novos.
INSERT INTO work_schedule (id, code, status, name, description, created_at)
SELECT
    '00000000-0000-0000-0000-0000000000a1'::uuid,
    COALESCE((SELECT MAX(code) FROM work_schedule), 0) + 1,
    'ACTIVE',
    'Escala Padrão',
    'Segunda a sexta, 44 horas semanais',
    now()
WHERE NOT EXISTS (
    SELECT 1
    FROM work_schedule
    WHERE id = '00000000-0000-0000-0000-0000000000a1'
       OR (LOWER(name) = LOWER('Escala Padrão') AND status <> 'DELETED')
);

INSERT INTO work_schedule_day (
    work_schedule_id, day_of_week, period1_start, period1_end, period2_start, period2_end
)
SELECT '00000000-0000-0000-0000-0000000000a1'::uuid, d.day_of_week, '08:00', '12:00', d.p2_start, '18:00'
FROM (
    VALUES
        ('MONDAY', TIME '13:00'),
        ('TUESDAY', TIME '13:00'),
        ('WEDNESDAY', TIME '13:00'),
        ('THURSDAY', TIME '13:00'),
        ('FRIDAY', TIME '14:00')
) AS d(day_of_week, p2_start)
WHERE EXISTS (
    SELECT 1 FROM work_schedule WHERE id = '00000000-0000-0000-0000-0000000000a1'
)
ON CONFLICT (work_schedule_id, day_of_week) DO NOTHING;
