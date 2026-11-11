package br.com.gesint.modules.rh.report.definition;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.report.ReportDefinition;
import br.com.gesint.modules.dp.organization.department.entity.Department;
import br.com.gesint.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gesint.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.rh.report.dto.PeriodReportFilterDto;
import br.com.gesint.modules.rh.report.model.AdmissionReportRow;

@Component
public class AdmissionReportDefinition implements ReportDefinition<PeriodReportFilterDto, AdmissionReportRow> {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final AdmissionProcessRepository admissionRepository;
    private final JobPositionRepository jobPositionRepository;
    private final DepartmentRepository departmentRepository;

    public AdmissionReportDefinition(
            AdmissionProcessRepository admissionRepository,
            JobPositionRepository jobPositionRepository,
            DepartmentRepository departmentRepository) {
        this.admissionRepository = admissionRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    public String templatePath() {
        return "reports/rh/admissions/admissions-by-period.jrxml";
    }

    @Override
    public String title() {
        return "Admissões por Período";
    }

    @Override
    public String filename(PeriodReportFilterDto filter) {
        return "admissoes-" + filter.getStartDate() + "-a-" + filter.getEndDate() + ".pdf";
    }

    @Override
    public Map<String, Object> parameters(PeriodReportFilterDto filter, List<AdmissionReportRow> rows) {
        Map<String, Object> parameters = ReportDefinition.super.parameters(filter, rows);
        parameters.put("FILTER_SUMMARY", DATE.format(filter.getStartDate()) + " a " + DATE.format(filter.getEndDate()));
        return parameters;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdmissionReportRow> load(PeriodReportFilterDto filter) {
        List<AdmissionProcess> admissions = admissionRepository.findForReport(
                filter.getStartDate(), filter.getEndDate(), AdmissionStatusEnum.CANCELLED, StatusEnum.DELETED);
        Set<UUID> jobIds = admissions.stream()
                .map(AdmissionProcess::getJobPositionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, JobPosition> jobs = jobPositionRepository.findAllById(jobIds).stream()
                .collect(Collectors.toMap(JobPosition::getId, Function.identity()));
        Set<UUID> departmentIds = admissions.stream()
                .map(AdmissionProcess::getDepartmentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        departmentIds.addAll(jobs.values().stream()
                .map(JobPosition::getDepartmentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<UUID, Department> departments = departmentRepository.findAllById(departmentIds).stream()
                .collect(Collectors.toMap(Department::getId, Function.identity()));

        return admissions.stream()
                .map(admission -> {
                    JobPosition job = jobs.get(admission.getJobPositionId());
                    UUID departmentId = admission.getDepartmentId() != null
                            ? admission.getDepartmentId()
                            : job == null ? null : job.getDepartmentId();
                    Department department = departments.get(departmentId);
                    return AdmissionReportRow.builder()
                            .employeeName(admission.getFullName())
                            .admissionDate(firstDate(admission))
                            .department(department == null ? "-" : department.getName())
                            .jobPosition(job == null ? "-" : job.getTitle())
                            .contractType(pretty(admission.getContractType().name()))
                            .status(statusLabel(admission.getAdmissionStatus()))
                            .build();
                })
                .toList();
    }

    private static java.time.LocalDate firstDate(AdmissionProcess admission) {
        if (admission.getContractStartDate() != null) return admission.getContractStartDate();
        if (admission.getExpectedStartDate() != null) return admission.getExpectedStartDate();
        if (admission.getCompletedAt() != null) return admission.getCompletedAt();
        return admission.getStartedAt();
    }

    private static String statusLabel(AdmissionStatusEnum status) {
        return switch (status) {
            case DRAFT -> "Rascunho";
            case IN_PROGRESS -> "Em andamento";
            case COMPLETED -> "Concluída";
            case CANCELLED -> "Cancelada";
        };
    }

    private static String pretty(String value) {
        String normalized = value.replace('_', ' ').toLowerCase(Locale.forLanguageTag("pt-BR"));
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }
}
