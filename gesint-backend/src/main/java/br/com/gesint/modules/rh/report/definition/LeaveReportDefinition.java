package br.com.gesint.modules.rh.report.definition;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.report.ReportDefinition;
import br.com.gesint.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.rh.person.leave.entity.LeaveAbsenceStatusEnum;
import br.com.gesint.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gesint.modules.rh.person.leave.repository.LeaveRequestRepository;
import br.com.gesint.modules.rh.report.dto.PeriodReportFilterDto;
import br.com.gesint.modules.rh.report.model.LeaveReportRow;

@Component
public class LeaveReportDefinition implements ReportDefinition<PeriodReportFilterDto, LeaveReportRow> {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final LeaveRequestRepository leaveRepository;
    private final CollaboratorRepository collaboratorRepository;

    public LeaveReportDefinition(
            LeaveRequestRepository leaveRepository, CollaboratorRepository collaboratorRepository) {
        this.leaveRepository = leaveRepository;
        this.collaboratorRepository = collaboratorRepository;
    }

    @Override
    public String templatePath() {
        return "reports/rh/leaves/leaves-by-period.jrxml";
    }

    @Override
    public String title() {
        return "Afastamentos por Período";
    }

    @Override
    public String filename(PeriodReportFilterDto filter) {
        return "afastamentos-" + filter.getStartDate() + "-a-" + filter.getEndDate() + ".pdf";
    }

    @Override
    public Map<String, Object> parameters(PeriodReportFilterDto filter, List<LeaveReportRow> rows) {
        Map<String, Object> parameters = ReportDefinition.super.parameters(filter, rows);
        parameters.put("FILTER_SUMMARY", DATE.format(filter.getStartDate()) + " a " + DATE.format(filter.getEndDate()));
        return parameters;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveReportRow> load(PeriodReportFilterDto filter) {
        var leaves = leaveRepository.findAbsencesForReport(
                filter.getStartDate(),
                filter.getEndDate(),
                LeaveTypeEnum.VACATION,
                LeaveAbsenceStatusEnum.CANCELLED,
                StatusEnum.DELETED);
        Set<UUID> collaboratorIds =
                leaves.stream().map(leave -> leave.getCollaboratorId()).collect(Collectors.toSet());
        Map<UUID, Collaborator> collaborators = collaboratorRepository.findAllById(collaboratorIds).stream()
                .collect(Collectors.toMap(Collaborator::getId, Function.identity()));

        return leaves.stream()
                .map(leave -> {
                    Collaborator collaborator = collaborators.get(leave.getCollaboratorId());
                    return LeaveReportRow.builder()
                            .employeeName(collaborator == null ? "-" : collaborator.getFullName())
                            .leaveType(leaveTypeLabel(leave.getLeaveType()))
                            .startDate(leave.getStartDate())
                            .endDate(leave.getEndDate())
                            .durationDays(leave.getDurationDays())
                            .status(statusLabel(leave.getAbsenceStatus(), leave.getApproved()))
                            .build();
                })
                .toList();
    }

    private static String statusLabel(LeaveAbsenceStatusEnum status, Boolean approved) {
        if (status == null) {
            return Boolean.TRUE.equals(approved) ? "Aprovado" : "Pendente";
        }
        return switch (status) {
            case PENDING -> "Pendente";
            case VALIDATED -> "Validado";
            case REFERRED_INSS -> "Encaminhado ao INSS";
            case APPROVED_INSS -> "Aprovado pelo INSS";
            case FINALIZED -> "Finalizado";
            case CANCELLED -> "Cancelado";
        };
    }

    private static String leaveTypeLabel(LeaveTypeEnum type) {
        return switch (type) {
            case MEDICAL -> "Afastamento médico";
            case MEDICAL_CERTIFICATE -> "Atestado médico";
            case SICK_LEAVE_INSS -> "Auxílio-doença / INSS";
            case OCCUPATIONAL_ACCIDENT -> "Acidente de trabalho";
            case MATERNITY -> "Licença-maternidade";
            case PATERNITY -> "Licença-paternidade";
            case BEREAVEMENT -> "Licença por falecimento";
            case MARRIAGE -> "Licença-casamento";
            case BLOOD_DONATION -> "Doação de sangue";
            case ELECTORAL_SERVICE -> "Serviço eleitoral";
            case MILITARY_SERVICE -> "Serviço militar";
            case JURY_DUTY -> "Júri";
            case UNION_REPRESENTATION -> "Representação sindical";
            case UNPAID, UNPAID_LEAVE -> "Licença não remunerada";
            case SUSPENSION -> "Suspensão";
            case UNJUSTIFIED_ABSENCE -> "Falta injustificada";
            case OTHER -> "Outro";
            case VACATION -> "Férias";
        };
    }

}
