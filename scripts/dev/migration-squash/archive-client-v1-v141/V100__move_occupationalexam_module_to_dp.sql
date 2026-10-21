-- Move o modulo occupationalexam do catalogo de perfis ADMIN de RH para DP
-- (espelha PermissionModuleCatalog apos migracao do menu Exames para o rail DP).

CREATE OR REPLACE FUNCTION public.gesint_admin_profile_modules(p_system gesint_types.system_scope_enum)
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

-- Concede occupationalexam ao Administrador DP.
SELECT public.gesint_sync_admin_profile_permissions();

-- Remove occupationalexam do Administrador RH (nao faz parte mais do catalogo RH).
DELETE FROM role_permission rp
USING role r, permission p
WHERE rp.role_id = r.id
  AND rp.permission_id = p.id
  AND r.id = '00000000-0000-0000-0000-000000000102'
  AND r.system = 'RH'
  AND r.role_type = 'ADMIN'
  AND p.module = 'occupationalexam';
