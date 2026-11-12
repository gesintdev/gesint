package br.com.gesint.modules.dp.report.definition;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
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
import br.com.gesint.modules.dp.offboarding.repository.OffboardingRepository;
import br.com.gesint.modules.dp.report.model.EmployeeRosterReportRow;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gesint.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gesint.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gesint.modules.rh.person.leave.repository.LeaveRequestRepository;
import br.com.gesint.modules.root.repository.AppUserRepository;

@Component
public class EmployeeRosterReportDefinition implements ReportDefinition<Void, EmployeeRosterReportRow> {

    private final CollaboratorRepository collaboratorRepository;
    private final EmploymentContractRepository contractRepository;
    private final JobPositionRepository jobPositionRepository;
    private final DepartmentRepository departmentRepository;
    private final OffboardingRepository offboardingRepository;
    private final LeaveRequestRepository leaveRepository;
    private final AppUserRepository appUserRepository;

    public EmployeeRosterReportDefinition(
            CollaboratorRepository collaboratorRepository,
            EmploymentContractRepository contractRepository,
            JobPositionRepository jobPositionRepository,
            DepartmentRepository departmentRepository,
            OffboardingRepository offboardingRepository,
            LeaveRequestRepository leaveRepository,
            AppUserRepository appUserRepository) {
        this.collaboratorRepository = collaboratorRepository;
        this.contractRepository = contractRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.departmentRepository = departmentRepository;
        this.offboardingRepository = offboardingRepository;
        this.leaveRepository = leaveRepository;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public String templatePath() {
        return "reports/dp/employees/employee-roster.jrxml";
    }

    @Override
    public String title() {
        return "Relatório de Funcionários";
    }

    @Override
    public String filename(Void filter) {
        return "relatorio-funcionarios.pdf";
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeRosterReportRow> load(Void filter) {
        Set<UUID> systemAdminIds =
                Set.copyOf(appUserRepository.findCollaboratorIdsLinkedToSystemAdmin(StatusEnum.DELETED));
        var collaborators = collaboratorRepository.findByStatusNotOrderByFullNameAsc(StatusEnum.DELETED).stream()
                .filter(collaborator -> !systemAdminIds.contains(collaborator.getId()))
                .toList();
        List<UUID> collaboratorIds =
                collaborators.stream().map(collaborator -> collaborator.getId()).toList();
        Set<UUID> offboardedIds = collaboratorIds.isEmpty()
                ? Set.of()
                : Set.copyOf(
                        offboardingRepository.findOffboardedCollaboratorIdsIn(collaboratorIds, StatusEnum.DELETED));
        LocalDate today = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        Set<UUID> leaveIds = collaboratorIds.isEmpty()
                ? Set.of()
                : leaveRepository
                        .findApprovedAbsencesByCollaboratorInOverlapping(
                                collaboratorIds,
                                LeaveTypeEnum.VACATION,
                                today,
                                today,
                                StatusEnum.DELETED)
                        .stream()
                        .map(leave -> leave.getCollaboratorId())
                        .collect(Collectors.toSet());
        Map<UUID, EmploymentContract> contracts = collaborators.stream()
                .map(collaborator -> contractRepository
                        .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(
                                collaborator.getId(), StatusEnum.DELETED)
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(EmploymentContract::getCollaboratorId, Function.identity()));

        Set<UUID> jobPositionIds = contracts.values().stream()
                .map(EmploymentContract::getJobPositionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, JobPosition> jobPositions = jobPositionRepository.findAllById(jobPositionIds).stream()
                .collect(Collectors.toMap(JobPosition::getId, Function.identity()));
        Set<UUID> departmentIds = jobPositions.values().stream()
                .map(JobPosition::getDepartmentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, Department> departments = departmentRepository.findAllById(departmentIds).stream()
                .collect(Collectors.toMap(Department::getId, Function.identity()));

        return collaborators.stream()
                .map(collaborator -> {
                    EmploymentContract contract = contracts.get(collaborator.getId());
                    JobPosition job = contract == null ? null : jobPositions.get(contract.getJobPositionId());
                    Department department = job == null ? null : departments.get(job.getDepartmentId());
                    return EmployeeRosterReportRow.builder()
                            .code(collaborator.getCode())
                            .employeeName(collaborator.getFullName())
                            .department(department == null ? "-" : department.getName())
                            .jobPosition(job == null ? "-" : job.getTitle())
                            .admissionDate(contract == null ? null : contract.getStartDate())
                            .status(statusLabel(collaborator.getId(), collaborator.getStatus(), offboardedIds, leaveIds))
                            .build();
                })
                .toList();
    }

    private static String statusLabel(
            UUID collaboratorId, StatusEnum status, Set<UUID> offboardedIds, Set<UUID> leaveIds) {
        if (offboardedIds.contains(collaboratorId)) return "Desligado";
        if (leaveIds.contains(collaboratorId)) return "Afastado";
        return status == StatusEnum.ACTIVE ? "Ativo" : "Inativo";
    }
}
