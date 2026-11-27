-- Gestao de Ponto: modulos attendance (saiu de DP/CFG), hourbank e timesheet.

CREATE OR REPLACE FUNCTION public.gesint_admin_profile_modules(p_system gesint_types.system_scope_enum) RETURNS text[]
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT CASE p_system
        WHEN 'CFG' THEN ARRAY[
            'role', 'actingprofile', 'user', 'workschedule', 'digitalcertificate', 'documenttype',
            'admission', 'exitinterview', 'developmentplanconfig', 'notification']
        WHEN 'DP' THEN ARRAY[
            'company', 'department', 'jobposition', 'workschedule', 'payment', 'collaborator',
            'admission', 'offboarding', 'occupationalexam', 'notification', 'agenda',
            'leave', 'storage']
        WHEN 'CONTABILIDADE' THEN ARRAY[
            'payroll', 'payrollevent', 'payslip', 'benefit', 'benefitenrollment', 'tax',
            'notification', 'agenda', 'storage']
        WHEN 'RH' THEN ARRAY[
            'collaborator', 'admission', 'exitinterview', 'contract', 'leave', 'performance',
            'jobvacancy', 'candidate', 'jobvacancyapplication', 'developmentplan',
            'notification', 'agenda', 'storage']
        WHEN 'PONTO' THEN ARRAY[
            'attendance', 'hourbank', 'timesheet', 'notification', 'agenda', 'storage']
        ELSE ARRAY[]::text[]
    END;
$$;

-- Permissoes novas (catalogo em public; schemas de cliente recebem pelo laco abaixo).
INSERT INTO public.permission (id, authority, module, description, code) VALUES
    ('5a000000-0000-0000-0000-000000000001', 'hourbank:read', 'hourbank', 'Consultar banco de horas', 10083),
    ('5a000000-0000-0000-0000-000000000002', 'hourbank:write', 'hourbank', 'Ajustar o banco de horas', 10084),
    ('5a000000-0000-0000-0000-000000000003', 'hourbank:export', 'hourbank', 'Exportar banco de horas', 10085),
    ('5a000000-0000-0000-0000-000000000004', 'timesheet:read', 'timesheet', 'Consultar espelho de ponto', 10086),
    ('5a000000-0000-0000-0000-000000000005', 'timesheet:write', 'timesheet', 'Fechar e reabrir espelho de ponto', 10087),
    ('5a000000-0000-0000-0000-000000000006', 'timesheet:export', 'timesheet', 'Gerar PDF do espelho de ponto', 10088)
ON CONFLICT DO NOTHING;

-- Espelho de ponto como documento com ciclo (aberto / fechado) por colaborador e periodo.
CREATE TABLE IF NOT EXISTS public.attendance_timesheet (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    closing_status character varying(20) DEFAULT 'OPEN' NOT NULL,
    closed_at timestamp with time zone,
    closed_by uuid,
    reopen_reason text,
    worked_minutes integer,
    overtime_minutes integer,
    hour_bank_minutes integer,
    pending_days integer,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    CONSTRAINT attendance_timesheet_pkey PRIMARY KEY (id),
    CONSTRAINT attendance_timesheet_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id),
    CONSTRAINT attendance_timesheet_period_check CHECK (period_end >= period_start)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_attendance_timesheet_code ON public.attendance_timesheet USING btree (code);
CREATE UNIQUE INDEX IF NOT EXISTS uk_attendance_timesheet_period ON public.attendance_timesheet USING btree (collaborator_id, period_start, period_end)
    WHERE (status <> 'DELETED'::gesint_types.status_enum);
CREATE INDEX IF NOT EXISTS idx_attendance_timesheet_company ON public.attendance_timesheet USING btree (company_id);

-- Administrador por sistema (role_type ADMIN): acesso dinamico via ADM:PONTO, sem role_permission.
INSERT INTO public.role (id, code, name, description, system, status, is_system, role_type, created_at)
SELECT '00000000-0000-0000-0000-000000000105'::uuid,
       COALESCE((SELECT MAX(code) FROM public.role), 0) + 1,
       'Administrador Gestão de Ponto',
       'Acesso total ao sistema de Gestão de Ponto',
       'PONTO', 'ACTIVE', true, 'ADMIN', now()
WHERE NOT EXISTS (SELECT 1 FROM public.role WHERE id = '00000000-0000-0000-0000-000000000105');

INSERT INTO public.role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
FROM public.permission p
WHERE p.module IN ('hourbank', 'timesheet')
  AND NOT EXISTS (
      SELECT 1 FROM public.role_permission rp
      WHERE rp.role_id = '00000000-0000-0000-0000-000000000001' AND rp.permission_id = p.id);

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            'INSERT INTO %I.permission (id, code, authority, module, description)
             SELECT p.id, p.code, p.authority, p.module, p.description
             FROM public.permission p
             WHERE p.module IN (''hourbank'', ''timesheet'')
             ON CONFLICT DO NOTHING',
            tenant_schema);

        IF to_regclass(format('%I.role', tenant_schema)) IS NOT NULL THEN
            EXECUTE format(
                'INSERT INTO %I.role (id, code, name, description, system, status, is_system, role_type, created_at)
                 SELECT ''00000000-0000-0000-0000-000000000105''::uuid,
                        COALESCE((SELECT MAX(code) FROM %I.role), 0) + 1,
                        ''Administrador Gestão de Ponto'',
                        ''Acesso total ao sistema de Gestão de Ponto'',
                        ''PONTO'', ''ACTIVE'', true, ''ADMIN'', now()
                 WHERE NOT EXISTS (SELECT 1 FROM %I.role WHERE id = ''00000000-0000-0000-0000-000000000105'')',
                tenant_schema, tenant_schema, tenant_schema);

            EXECUTE format(
                'INSERT INTO %I.role_permission (role_id, permission_id)
                 SELECT ''00000000-0000-0000-0000-000000000001''::uuid, p.id
                 FROM %I.permission p
                 WHERE p.module IN (''hourbank'', ''timesheet'')
                   AND EXISTS (SELECT 1 FROM %I.role r WHERE r.id = ''00000000-0000-0000-0000-000000000001'')
                   AND NOT EXISTS (
                       SELECT 1 FROM %I.role_permission rp
                       WHERE rp.role_id = ''00000000-0000-0000-0000-000000000001'' AND rp.permission_id = p.id)',
                tenant_schema, tenant_schema, tenant_schema, tenant_schema);
        END IF;

        IF to_regclass(format('%I.collaborator', tenant_schema)) IS NOT NULL
           AND to_regclass(format('%I.attendance_timesheet', tenant_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.attendance_timesheet (LIKE public.attendance_timesheet INCLUDING ALL)',
                tenant_schema);
        END IF;
    END LOOP;
END
$$;

-- Perfis ADMIN de DP/CFG deixam de cobrir attendance pelo catalogo dinamico (ADM:DP / ADM:CFG).
-- Perfis customizados que ja tinham attendance:* continuam com a permissao concedida.

SELECT public.gesint_audit_sync_table('attendance_timesheet');
