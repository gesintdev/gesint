package br.com.gommo.admin.modules.client.service;

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
            "collaborator",
            "collaborator_address",
            "collaborator_contact",
            "employment_contract",
            "contract_recess_policy",
            "contract_recess_period",
            "admission_process",
            "attendance_record",
            "benefit_plan",
            "benefit_enrollment",
            "leave_request",
            "system_setting",
            "system_notification",
            "offboarding",
            "exit_interview",
            "exit_interview_return_checklist_item",
            "performance_review",
            "job_vacancy",
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
            "audit_log");

    private TenantSchemaTableCatalog() {}
}
