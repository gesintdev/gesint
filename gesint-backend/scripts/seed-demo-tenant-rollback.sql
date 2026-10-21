-- =====================================================================================
-- Remove os dados criados por scripts/seed-demo-tenant.sql.
--
-- Apaga exclusivamente linhas com created_by = SEED_MARKER, então não encosta em dado
-- real do cliente. A ordem é filha -> pai, porque o schema template (public) tem FKs;
-- schema de tenant provisionado via LIKE não tem, mas a ordem correta serve para os dois.
--
-- USO: troque o schema na linha SET search_path e rode o arquivo inteiro.
-- =====================================================================================

BEGIN;

-- >>> ALTERE AQUI: schema do cliente de teste <<<
SET search_path TO "COLE_O_SCHEMA_DO_TENANT", gesint_types, public;

DO $guard$
BEGIN
    IF current_schema() IS NULL OR current_schema() IN ('public', 'gesint_types') THEN
        RAISE EXCEPTION 'search_path aponta para "%": informe o schema do tenant.', current_schema();
    END IF;
END
$guard$;

-- work_schedule_day não tem created_by: apaga pelo work_schedule de demo.
DELETE FROM work_schedule_day
 WHERE work_schedule_id IN (SELECT id FROM work_schedule WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid);

DELETE FROM admission_process_kanban_column WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM job_vacancy_application WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM job_vacancy             WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM candidate               WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM performance_review      WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM payslip_entry           WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM payslip                 WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM payroll_run             WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM leave_request           WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM attendance_record       WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM benefit_enrollment      WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM benefit_plan            WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM employment_contract     WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM collaborator_contact    WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM collaborator_address    WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM collaborator            WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM work_schedule           WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM job_position            WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM department              WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
DELETE FROM company                 WHERE created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;

DO $resumo$
DECLARE
    v_marker uuid := 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    v_tbl text;
    v_n integer;
    v_total integer := 0;
BEGIN
    FOREACH v_tbl IN ARRAY ARRAY['company','department','job_position','work_schedule','collaborator',
                                 'collaborator_address','collaborator_contact','employment_contract',
                                 'benefit_plan','benefit_enrollment','attendance_record','leave_request',
                                 'payroll_run','payslip','payslip_entry','performance_review',
                                 'candidate','job_vacancy','job_vacancy_application',
                                 'admission_process_kanban_column']
    LOOP
        EXECUTE format('SELECT count(*) FROM %I.%I WHERE created_by = $1', current_schema(), v_tbl)
            INTO v_n USING v_marker;
        v_total := v_total + v_n;
    END LOOP;
    IF v_total > 0 THEN
        RAISE EXCEPTION 'Ainda restam % linhas de demo — rollback incompleto.', v_total;
    END IF;
    RAISE NOTICE 'Schema "%": nenhum dado de demo restante.', current_schema();
END
$resumo$;

COMMIT;
