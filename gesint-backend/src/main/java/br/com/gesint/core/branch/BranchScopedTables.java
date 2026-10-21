package br.com.gesint.core.branch;

import java.util.Set;

/**
 * Tabelas que carregam {@code company_id}.
 *
 * SQL nativo nao passa pelo filtro do Hibernate, entao consultas nativas precisam saber quais
 * tabelas podem receber o predicado de filial e quais nao tem a coluna.
 *
 * {@code BranchScopedEntityFilterTest} compara esta lista com as entidades que estendem
 * {@link BranchScopedEntity}, para que ela nao envelheca em silencio.
 */
public final class BranchScopedTables {

    public static final Set<String> NAMES = Set.of(
            "admission_process",
            "admission_step",
            "agenda_event",
            "attendance_record",
            "attendance_request",
            "benefit_enrollment",
            "candidate",
            "collaborator",
            "collaborator_address",
            "collaborator_contact",
            "complementary_exam",
            "contract_recess_period",
            "contract_recess_policy",
            "development_plan",
            "digital_certificate",
            "employment_contract",
            "esocial_event",
            "esocial_health_event",
            "exit_interview",
            "job_requisition",
            "job_vacancy",
            "job_vacancy_application",
            "leave_request",
            "occupational_exam",
            "offboarding",
            "payment_batch",
            "payment_period",
            "payment_slip",
            "payroll_run",
            "payslip",
            "payslip_entry",
            "performance_review",
            "storage_object",
            "storage_object_link",
            "system_notification",
            "tax_obligation");

    private BranchScopedTables() {}

    public static boolean isScoped(String tableName) {
        return tableName != null && NAMES.contains(tableName.trim().toLowerCase());
    }
}
