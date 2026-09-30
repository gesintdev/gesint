package br.com.gommo.core.audit.trail;

import java.util.Map;

import br.com.gommo.core.entity.CodedEntity;

/**
 * Rotulo do registro na trilha: nome da entidade em portugues + codigo amigavel
 * (ex.: "Afastamento #148"). Nao grava nomes de pessoas (minimizacao LGPD).
 *
 * Entidade nova com CRUD deve entrar aqui ({@code AuditRecordLabelsTest} cobra os servicos
 * que estendem BaseService).
 */
public final class AuditRecordLabels {

    private static final Map<String, String> LABELS = Map.ofEntries(
            Map.entry("AdmissionProcess", "Admissão"),
            Map.entry("AdmissionProcessKanbanColumn", "Coluna do kanban de admissão"),
            Map.entry("AgendaEvent", "Evento da agenda"),
            Map.entry("ActingProfile", "Atuação"),
            Map.entry("AppUser", "Usuário"),
            Map.entry("AttendanceRecord", "Registro de ponto"),
            Map.entry("AttendanceRequest", "Solicitação de ponto"),
            Map.entry("BenefitEnrollment", "Vínculo de benefício"),
            Map.entry("BenefitPlan", "Plano de benefício"),
            Map.entry("Candidate", "Candidato"),
            Map.entry("Collaborator", "Colaborador"),
            Map.entry("Company", "Empresa"),
            Map.entry("Competency", "Competência"),
            Map.entry("ComplementaryExam", "Exame complementar"),
            Map.entry("Department", "Departamento"),
            Map.entry("DevelopmentActionTemplate", "Modelo de ação de PDI"),
            Map.entry("DevelopmentPlan", "PDI"),
            Map.entry("DevelopmentPlanOrigin", "Origem de PDI"),
            Map.entry("DevelopmentTrack", "Trilha de desenvolvimento"),
            Map.entry("DigitalCertificate", "Certificado digital"),
            Map.entry("DocumentType", "Tipo de documento"),
            Map.entry("EmploymentContract", "Contrato"),
            Map.entry("EsocialTable27Procedure", "Procedimento eSocial"),
            Map.entry("EvidenceType", "Tipo de evidência"),
            Map.entry("ExamRequirement", "Exigência de exame"),
            Map.entry("ExitInterview", "Entrevista de desligamento"),
            Map.entry("ExitInterviewReturnChecklistConfig", "Item de devolução"),
            Map.entry("JobPosition", "Cargo"),
            Map.entry("JobPositionCompetency", "Competência do cargo"),
            Map.entry("JobPositionSalaryTable", "Tabela salarial"),
            Map.entry("JobVacancy", "Vaga"),
            Map.entry("JobVacancyApplication", "Candidatura"),
            Map.entry("LeaveRequest", "Afastamento"),
            Map.entry("MedicalClinic", "Clínica"),
            Map.entry("OccupationalExam", "Exame ocupacional"),
            Map.entry("OccupationalPhysician", "Médico do trabalho"),
            Map.entry("Offboarding", "Desligamento"),
            Map.entry("PaymentBatch", "Lote de pagamento"),
            Map.entry("PaymentPeriod", "Período de pagamento"),
            Map.entry("PayrollEvent", "Evento de folha"),
            Map.entry("PayrollRun", "Folha"),
            Map.entry("Payslip", "Holerite"),
            Map.entry("PayslipEntry", "Lançamento de holerite"),
            Map.entry("PerformanceReview", "Avaliação de desempenho"),
            Map.entry("ProficiencyLevel", "Nível de proficiência"),
            Map.entry("Role", "Perfil"),
            Map.entry("StorageObject", "Anexo"),
            Map.entry("TaxObligation", "Obrigação fiscal"),
            Map.entry("WorkSchedule", "Escala"));

    private AuditRecordLabels() {}

    public static boolean has(Class<?> type) {
        return LABELS.containsKey(type.getSimpleName());
    }

    public static String typeLabel(Class<?> type) {
        return LABELS.getOrDefault(type.getSimpleName(), type.getSimpleName());
    }

    public static String of(Class<?> type, Object entity) {
        String label = typeLabel(type);
        if (entity instanceof CodedEntity coded && coded.getCode() != null) {
            return label + " #" + coded.getCode();
        }
        return label;
    }
}
