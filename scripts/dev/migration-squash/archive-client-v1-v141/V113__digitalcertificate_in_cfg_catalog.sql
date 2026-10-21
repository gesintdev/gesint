-- Inclui digitalcertificate no catalogo CFG (menu Certificados digitais no cadastro de perfil).

CREATE OR REPLACE FUNCTION public.gesint_admin_profile_modules(p_system gesint_types.system_scope_enum)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE p_system
        WHEN 'CFG' THEN ARRAY[
            'role', 'actingprofile', 'user', 'workschedule', 'digitalcertificate',
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
