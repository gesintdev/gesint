-- Permissoes de exportacao (Excel) e dado sensivel/financeiro (RN-03 · D4 · D7).
-- Espelha em todos os schemas que possuem tabela permission (nao so tenant_*%).

INSERT INTO permission (id, code, module, authority, description) VALUES
    -- export
    ('53000000-0000-0000-0000-000000000001', 10001, 'collaborator', 'collaborator:export', 'Exportar listagem de colaboradores'),
    ('53000000-0000-0000-0000-000000000002', 10002, 'admission', 'admission:export', 'Exportar listagem de admissoes'),
    ('53000000-0000-0000-0000-000000000003', 10003, 'leave', 'leave:export', 'Exportar listagem de afastamentos'),
    ('53000000-0000-0000-0000-000000000004', 10004, 'offboarding', 'offboarding:export', 'Exportar listagem de desligamentos'),
    ('53000000-0000-0000-0000-000000000005', 10005, 'occupationalexam', 'occupationalexam:export', 'Exportar listagem de exames ocupacionais'),
    ('53000000-0000-0000-0000-000000000006', 10006, 'jobvacancy', 'jobvacancy:export', 'Exportar listagem de vagas'),
    ('53000000-0000-0000-0000-000000000007', 10007, 'candidate', 'candidate:export', 'Exportar listagem de candidatos'),
    ('53000000-0000-0000-0000-000000000008', 10008, 'department', 'department:export', 'Exportar listagem de departamentos'),
    ('53000000-0000-0000-0000-000000000009', 10009, 'jobposition', 'jobposition:export', 'Exportar listagem de cargos'),
    ('53000000-0000-0000-0000-00000000000a', 10010, 'payment', 'payment:export', 'Exportar listagem de pagamentos'),
    ('53000000-0000-0000-0000-00000000000b', 10011, 'payroll', 'payroll:export', 'Exportar listagem de folhas'),
    ('53000000-0000-0000-0000-00000000000c', 10012, 'attendance', 'attendance:export', 'Exportar listagem de ponto'),
    ('53000000-0000-0000-0000-00000000000d', 10013, 'actingprofile', 'actingprofile:export', 'Exportar listagem de perfis de atuacao'),
    ('53000000-0000-0000-0000-00000000000e', 10014, 'role', 'role:export', 'Exportar listagem de perfis'),
    ('53000000-0000-0000-0000-00000000000f', 10015, 'user', 'user:export', 'Exportar listagem de usuarios'),
    ('53000000-0000-0000-0000-000000000010', 10016, 'company', 'company:export', 'Exportar listagem de empresas'),
    ('53000000-0000-0000-0000-000000000011', 10017, 'workschedule', 'workschedule:export', 'Exportar listagem de jornadas'),
    ('53000000-0000-0000-0000-000000000012', 10018, 'exitinterview', 'exitinterview:export', 'Exportar listagem de entrevistas de desligamento'),
    ('53000000-0000-0000-0000-000000000013', 10019, 'contract', 'contract:export', 'Exportar listagem de contratos'),
    ('53000000-0000-0000-0000-000000000014', 10020, 'performance', 'performance:export', 'Exportar listagem de desempenho'),
    ('53000000-0000-0000-0000-000000000015', 10021, 'jobvacancyapplication', 'jobvacancyapplication:export', 'Exportar listagem de candidaturas'),
    ('53000000-0000-0000-0000-000000000016', 10022, 'developmentplan', 'developmentplan:export', 'Exportar listagem de planos de desenvolvimento'),
    ('53000000-0000-0000-0000-000000000017', 10023, 'payslip', 'payslip:export', 'Exportar listagem de holerites'),
    ('53000000-0000-0000-0000-000000000018', 10024, 'benefit', 'benefit:export', 'Exportar listagem de beneficios'),
    ('53000000-0000-0000-0000-000000000019', 10025, 'benefitenrollment', 'benefitenrollment:export', 'Exportar listagem de adesoes a beneficios'),
    ('53000000-0000-0000-0000-00000000001a', 10026, 'payrollevent', 'payrollevent:export', 'Exportar listagem de eventos de folha'),
    ('53000000-0000-0000-0000-00000000001b', 10027, 'tax', 'tax:export', 'Exportar listagem de impostos'),
    ('53000000-0000-0000-0000-00000000001c', 10028, 'agenda', 'agenda:export', 'Exportar listagem de agenda'),
    ('53000000-0000-0000-0000-00000000001d', 10029, 'notification', 'notification:export', 'Exportar listagem de notificacoes'),
    -- sensitive / financial (clinical ja existe em occupationalexam)
    ('53000000-0000-0000-0000-000000000030', 10040, 'collaborator', 'collaborator:sensitive', 'Visualizar dados sensiveis de colaboradores (LGPD)'),
    ('53000000-0000-0000-0000-000000000031', 10041, 'collaborator', 'collaborator:financial', 'Visualizar dados financeiros de colaboradores'),
    ('53000000-0000-0000-0000-000000000032', 10042, 'leave', 'leave:sensitive', 'Visualizar dados sensiveis de afastamentos (CID, atestado)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM permission p
WHERE p.id::text LIKE '53000000-0000-0000-0000-%'
ON CONFLICT DO NOTHING;

SELECT public.gesint_sync_admin_profile_permissions();

DO $sync_export_sensitive$
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
        EXECUTE format(
            $sql$
            INSERT INTO %I.permission (id, code, authority, module, description)
            SELECT p.id, p.code, p.authority, p.module, p.description
            FROM public.permission p
            WHERE p.id::text LIKE '53000000-0000-0000-0000-%%'
            ON CONFLICT (id) DO NOTHING
            $sql$,
            target_schema
        );

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.id::text LIKE '53000000-0000-0000-0000-%%'
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_export_sensitive$;
