package br.com.gesint.admin.modules.client.service;

import java.util.List;

/**
 * Canonical list of HR data-plane tables cloned into each tenant schema.
 * Keep in sync with scripts/dev/seed-tenant-empresa-a.sql (tenant_tables array).
 */
public final class TenantSchemaTableCatalog {

    public static final List<String> HR_DATA_TABLES = List.of(
            "company",
            "department",
            "job_position",
            "job_position_salary_table",
            "job_position_salary_table_item",
            "job_position_competency",
            "collaborator",
            "collaborator_address",
            "collaborator_contact",
            "employment_contract",
            "contract_recess_policy",
            "contract_recess_period",
            "work_schedule",
            "work_schedule_day",
            "admission_process",
            "admission_process_kanban_column",
            "admission_step",
            "esocial_event",
            "attendance_record",
            "attendance_request",
            "benefit_plan",
            "benefit_enrollment",
            "leave_request",
            "medical_clinic",
            "occupational_physician",
            "occupational_physician_clinic",
            "esocial_table27_procedure",
            "esocial_table19_dismissal_reason",
            "exam_requirement",
            "occupational_exam",
            "complementary_exam",
            "esocial_health_event",
            "digital_certificate",
            "document_type",
            "acting_profile",
            "user_acting_profile",
            "system_setting",
            "system_notification",
            "agenda_event",
            "offboarding",
            "exit_interview",
            "exit_interview_return_checklist_item",
            "performance_review",
            "job_vacancy",
            "job_vacancy_competency",
            "job_requisition",
            "careers_page",
            "careers_page_block",
            "candidate",
            "candidate_experience",
            "candidate_account",
            "job_vacancy_application",
            "job_application_interview_evaluation",
            "job_application_interview_score",
            "experience_evaluation",
            "experience_evaluation_score",
            "competency",
            "proficiency_level",
            "development_track",
            "development_track_competency",
            "development_action_template",
            "evidence_type",
            "development_plan_origin",
            "development_plan",
            "development_plan_competency",
            "development_plan_goal",
            "development_plan_action",
            "development_plan_checkin",
            "development_plan_evidence",
            "payroll_run",
            "payroll_event",
            "payslip",
            "payslip_entry",
            "payment_period",
            "payment_batch",
            "payment_slip",
            "storage_object",
            "storage_object_link",
            "tax_obligation",
            "search_document",
            "audit_log");

    /**
     * Historico Hibernate Envers do Client. As tabelas {@code <tabela>_aud} nao sao listadas aqui:
     * o sincronizador replica toda tabela de public com este sufixo, entao uma migration nova com
     * {@code public.gesint_audit_sync_table('<tabela>')} ja chega aos tenants sem editar o catalogo.
     */
    public static final String AUDIT_REVISION_TABLE = "revinfo";

    public static final String AUDIT_TABLE_SUFFIX = "_aud";

    /** Perfil padrao Auditor (trilha de auditoria, RN-05), seedado pela migration V122 do Client. */
    public static final String AUDITOR_ROLE_ID = "56000000-0000-0000-0000-000000000100";

    private TenantSchemaTableCatalog() {}
}
