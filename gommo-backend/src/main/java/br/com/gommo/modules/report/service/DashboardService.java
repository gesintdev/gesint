package br.com.gommo.modules.report.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.report.dto.DashboardDistributionItemResponseDto;
import br.com.gommo.modules.report.dto.DashboardMetricResponseDto;
import br.com.gommo.modules.report.dto.DashboardModuleHealthResponseDto;
import br.com.gommo.modules.report.dto.DashboardModuleStatusResponseDto;
import br.com.gommo.modules.report.dto.DashboardMovementPointResponseDto;
import br.com.gommo.modules.report.dto.DashboardSummaryResponseDto;
import br.com.gommo.modules.report.repository.DashboardMetricsDao;

@Service
public class DashboardService implements IDashboardService {

    private static final ZoneId APP_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private record ModuleDefinition(String key, String label, String tableName) {}

    private static final List<ModuleDefinition> TRACKED_MODULES = List.of(
            new ModuleDefinition("collaborator", "Colaboradores", "collaborator"),
            new ModuleDefinition("admission", "Admissão", "admission_process"),
            new ModuleDefinition("contract", "Contratos", "employment_contract"),
            new ModuleDefinition("leave", "Férias", "leave_request"),
            new ModuleDefinition("payroll", "Folha", "payroll_run"),
            new ModuleDefinition("payslip", "Holerites", "payslip"),
            new ModuleDefinition("attendance", "Ponto", "attendance_record"),
            new ModuleDefinition("offboarding", "Desligamento", "offboarding"),
            new ModuleDefinition("benefit", "Benefícios", "benefit_plan"),
            new ModuleDefinition("company", "Empresas", "company"),
            new ModuleDefinition("department", "Departamentos", "department"),
            new ModuleDefinition("jobposition", "Cargos", "job_position"));

    private final DashboardMetricsDao dashboardMetricsDao;

    public DashboardService(DashboardMetricsDao dashboardMetricsDao) {
        this.dashboardMetricsDao = dashboardMetricsDao;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public DashboardSummaryResponseDto getSummary() {
        LocalDate today = LocalDate.now(APP_ZONE);
        OffsetDateTime last30Days = today.minusDays(30).atStartOfDay(APP_ZONE).toOffsetDateTime();
        OffsetDateTime last7DaysStart =
                today.minusDays(6).atStartOfDay(APP_ZONE).toOffsetDateTime();

        long activeCollaborators = dashboardMetricsDao.countActiveCollaborators();
        long newCollaborators = dashboardMetricsDao.countCollaboratorsCreatedSince(last30Days);
        long activeContracts = dashboardMetricsDao.countActiveContracts(today);
        long openPayrollRuns = dashboardMetricsDao.countOpenPayrollRuns(today.getYear(), today.getMonthValue());
        long pendingLeave = dashboardMetricsDao.countPendingLeaveRequests();

        return DashboardSummaryResponseDto.builder()
                .metrics(buildMetrics(
                        activeCollaborators, newCollaborators, activeContracts, openPayrollRuns, pendingLeave, today))
                .movementLast7Days(buildMovement(last7DaysStart, today))
                .moduleHealth(buildModuleHealth())
                .admissionsByStatus(buildAdmissionsByStatus())
                .leaveByType(buildLeaveByType())
                .build();
    }

    private List<DashboardMetricResponseDto> buildMetrics(
            long activeCollaborators,
            long newCollaborators,
            long activeContracts,
            long openPayrollRuns,
            long pendingLeave,
            LocalDate today) {
        List<DashboardMetricResponseDto> metrics = new ArrayList<>();

        metrics.add(DashboardMetricResponseDto.builder()
                .key("collaborators")
                .label("Colaboradores ativos")
                .value(activeCollaborators)
                .hint(
                        newCollaborators > 0
                                ? newCollaborators + " novos nos últimos 30 dias"
                                : "Nenhum cadastro recente")
                .tone(newCollaborators > 0 ? "success" : "neutral")
                .build());

        metrics.add(DashboardMetricResponseDto.builder()
                .key("contracts")
                .label("Contratos ativos")
                .value(activeContracts)
                .hint(activeContracts > 0 ? "Vigentes ou sem término" : "Sem contratos cadastrados")
                .tone(activeContracts > 0 ? "success" : "neutral")
                .build());

        metrics.add(DashboardMetricResponseDto.builder()
                .key("payroll")
                .label("Folha em aberto")
                .value(openPayrollRuns)
                .hint(
                        openPayrollRuns > 0
                                ? "Referência " + String.format("%02d/%d", today.getMonthValue(), today.getYear())
                                : "Nenhuma folha aberta no mês")
                .tone(openPayrollRuns > 0 ? "warning" : "neutral")
                .build());

        metrics.add(DashboardMetricResponseDto.builder()
                .key("leave")
                .label("Férias pendentes")
                .value(pendingLeave)
                .hint(pendingLeave > 0 ? "Aguardando aprovação" : "Nenhuma solicitação pendente")
                .tone(pendingLeave > 0 ? "warning" : "success")
                .build());

        return metrics;
    }

    private List<DashboardMovementPointResponseDto> buildMovement(OffsetDateTime since, LocalDate today) {
        Map<LocalDate, Long> totals = dashboardMetricsDao.countMovementSince(since);
        LocalDate start = today.minusDays(6);
        List<DashboardMovementPointResponseDto> points = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate day = start.plusDays(i);
            points.add(DashboardMovementPointResponseDto.builder()
                    .date(day.toString())
                    .label(formatDayLabel(day))
                    .total(totals.getOrDefault(day, 0L))
                    .build());
        }
        return points;
    }

    private DashboardModuleHealthResponseDto buildModuleHealth() {
        List<DashboardModuleStatusResponseDto> modules = new ArrayList<>();
        int activeModules = 0;

        for (ModuleDefinition module : TRACKED_MODULES) {
            long records = dashboardMetricsDao.countModuleRecords(module.tableName());
            boolean active = records > 0;
            if (active) {
                activeModules++;
            }
            modules.add(DashboardModuleStatusResponseDto.builder()
                    .key(module.key())
                    .label(module.label())
                    .active(active)
                    .records(records)
                    .build());
        }

        int totalModules = TRACKED_MODULES.size();
        int progressPercent = totalModules == 0 ? 0 : Math.round((activeModules * 100f) / totalModules);

        return DashboardModuleHealthResponseDto.builder()
                .activeModules(activeModules)
                .totalModules(totalModules)
                .progressPercent(progressPercent)
                .modules(modules)
                .build();
    }

    private List<DashboardDistributionItemResponseDto> buildAdmissionsByStatus() {
        Map<String, Long> totals = dashboardMetricsDao.countAdmissionsByStatus();
        List<DashboardDistributionItemResponseDto> items = new ArrayList<>();

        for (AdmissionStatusEnum status : AdmissionStatusEnum.values()) {
            items.add(DashboardDistributionItemResponseDto.builder()
                    .key(status.name())
                    .label(formatAdmissionStatus(status))
                    .value(totals.getOrDefault(status.name(), 0L))
                    .build());
        }
        return items;
    }

    private List<DashboardDistributionItemResponseDto> buildLeaveByType() {
        Map<String, Long> totals = dashboardMetricsDao.countLeaveByType();
        List<DashboardDistributionItemResponseDto> items = new ArrayList<>();

        for (LeaveTypeEnum type : LeaveTypeEnum.values()) {
            items.add(DashboardDistributionItemResponseDto.builder()
                    .key(type.name())
                    .label(formatLeaveType(type))
                    .value(totals.getOrDefault(type.name(), 0L))
                    .build());
        }
        return items;
    }

    private String formatDayLabel(LocalDate day) {
        DayOfWeek dayOfWeek = day.getDayOfWeek();
        return dayOfWeek.getDisplayName(TextStyle.SHORT, PT_BR).replace(".", "");
    }

    private String formatAdmissionStatus(AdmissionStatusEnum status) {
        return switch (status) {
            case DRAFT -> "Rascunho";
            case IN_PROGRESS -> "Em andamento";
            case COMPLETED -> "Concluída";
            case CANCELLED -> "Cancelada";
        };
    }

    private String formatLeaveType(LeaveTypeEnum type) {
        return switch (type) {
            case VACATION -> "Férias";
            case MEDICAL -> "Afastamento médico";
            case MATERNITY -> "Maternidade";
            case PATERNITY -> "Paternidade";
            case UNPAID -> "Não remunerado";
            case OTHER -> "Outro";
        };
    }
}
