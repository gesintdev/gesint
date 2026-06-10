package br.com.gommo.admin.modules.dashboard.service;

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

import br.com.gommo.admin.modules.dashboard.dto.DashboardDistributionItemResponseDto;
import br.com.gommo.admin.modules.dashboard.dto.DashboardMetricResponseDto;
import br.com.gommo.admin.modules.dashboard.dto.DashboardModuleHealthResponseDto;
import br.com.gommo.admin.modules.dashboard.dto.DashboardModuleStatusResponseDto;
import br.com.gommo.admin.modules.dashboard.dto.DashboardMovementPointResponseDto;
import br.com.gommo.admin.modules.dashboard.dto.DashboardSummaryResponseDto;
import br.com.gommo.admin.modules.dashboard.repository.DashboardMetricsDao;

@Service
public class DashboardService implements IDashboardService {

    private static final ZoneId APP_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private record ModuleDefinition(String key, String label, String tableName) {}

    private static final List<ModuleDefinition> TRACKED_MODULES = List.of(
            new ModuleDefinition("client", "Clientes", "client"),
            new ModuleDefinition("client_user", "Usuarios de cliente", "client_user"),
            new ModuleDefinition("subscription", "Assinaturas", "client_subscription"),
            new ModuleDefinition("payment", "Cobrancas", "client_payment"));

    private final DashboardMetricsDao dashboardMetricsDao;

    public DashboardService(DashboardMetricsDao dashboardMetricsDao) {
        this.dashboardMetricsDao = dashboardMetricsDao;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public DashboardSummaryResponseDto getSummary() {
        LocalDate today = LocalDate.now(APP_ZONE);
        OffsetDateTime last30Days = today.minusDays(30).atStartOfDay(APP_ZONE).toOffsetDateTime();
        OffsetDateTime last7DaysStart =
                today.minusDays(6).atStartOfDay(APP_ZONE).toOffsetDateTime();

        long activeClients = dashboardMetricsDao.countActiveClients();
        long newClients = dashboardMetricsDao.countClientsCreatedSince(last30Days);
        long readyTenants = dashboardMetricsDao.countReadyTenants();
        long activeSubscriptions = dashboardMetricsDao.countActiveSubscriptions();
        long pendingProvisioning = dashboardMetricsDao.countPendingProvisioning();

        return DashboardSummaryResponseDto.builder()
                .metrics(
                        buildMetrics(activeClients, newClients, readyTenants, activeSubscriptions, pendingProvisioning))
                .movementLast7Days(buildMovement(last7DaysStart, today))
                .moduleHealth(buildModuleHealth())
                .admissionsByStatus(buildProvisioningStatus())
                .leaveByType(buildPlansByType())
                .build();
    }

    private List<DashboardMetricResponseDto> buildMetrics(
            long activeClients,
            long newClients,
            long readyTenants,
            long activeSubscriptions,
            long pendingProvisioning) {
        List<DashboardMetricResponseDto> metrics = new ArrayList<>();

        metrics.add(DashboardMetricResponseDto.builder()
                .key("collaborators")
                .label("Clientes ativos")
                .value(activeClients)
                .hint(newClients > 0 ? newClients + " novos nos ultimos 30 dias" : "Nenhum cadastro recente")
                .tone(newClients > 0 ? "success" : "neutral")
                .build());

        metrics.add(DashboardMetricResponseDto.builder()
                .key("contracts")
                .label("Tenants prontos")
                .value(readyTenants)
                .hint(readyTenants > 0 ? "Provisionamento concluido" : "Nenhum tenant pronto")
                .tone(readyTenants > 0 ? "success" : "neutral")
                .build());

        metrics.add(DashboardMetricResponseDto.builder()
                .key("payroll")
                .label("Assinaturas ativas")
                .value(activeSubscriptions)
                .hint(activeSubscriptions > 0 ? "Planos em vigencia" : "Sem assinaturas ativas")
                .tone(activeSubscriptions > 0 ? "success" : "neutral")
                .build());

        metrics.add(DashboardMetricResponseDto.builder()
                .key("leave")
                .label("Provisionamento pendente")
                .value(pendingProvisioning)
                .hint(pendingProvisioning > 0 ? "Requer atencao da operacao" : "Fila vazia")
                .tone(pendingProvisioning > 0 ? "warning" : "success")
                .build());

        return metrics;
    }

    private List<DashboardMovementPointResponseDto> buildMovement(OffsetDateTime since, LocalDate today) {
        Map<LocalDate, Long> totals = dashboardMetricsDao.countClientsCreatedPerDaySince(since);
        List<DashboardMovementPointResponseDto> points = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate day = today.minusDays(6 - i);
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, PT_BR);
            if (day.getDayOfWeek() == DayOfWeek.SUNDAY || day.getDayOfWeek() == DayOfWeek.SATURDAY) {
                label = label.substring(0, 1).toUpperCase(PT_BR) + label.substring(1);
            }
            points.add(DashboardMovementPointResponseDto.builder()
                    .date(day.toString())
                    .label(label)
                    .total(totals.getOrDefault(day, 0L))
                    .build());
        }

        return points;
    }

    private DashboardModuleHealthResponseDto buildModuleHealth() {
        List<DashboardModuleStatusResponseDto> modules = new ArrayList<>();
        int activeModules = 0;

        for (ModuleDefinition module : TRACKED_MODULES) {
            long records = dashboardMetricsDao.countTableRecords(module.tableName());
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
        int progressPercent = totalModules == 0 ? 0 : (activeModules * 100) / totalModules;

        return DashboardModuleHealthResponseDto.builder()
                .activeModules(activeModules)
                .totalModules(totalModules)
                .progressPercent(progressPercent)
                .modules(modules)
                .build();
    }

    private List<DashboardDistributionItemResponseDto> buildProvisioningStatus() {
        Map<String, Long> totals = dashboardMetricsDao.countClientsByProvisioningStatus();
        List<DashboardDistributionItemResponseDto> items = new ArrayList<>();

        for (Map.Entry<String, Long> entry : totals.entrySet()) {
            items.add(DashboardDistributionItemResponseDto.builder()
                    .key(entry.getKey())
                    .label(provisioningLabel(entry.getKey()))
                    .value(entry.getValue())
                    .build());
        }

        return items;
    }

    private List<DashboardDistributionItemResponseDto> buildPlansByType() {
        Map<String, Long> totals = dashboardMetricsDao.countSubscriptionsByPlan();
        List<DashboardDistributionItemResponseDto> items = new ArrayList<>();

        for (Map.Entry<String, Long> entry : totals.entrySet()) {
            items.add(DashboardDistributionItemResponseDto.builder()
                    .key(entry.getKey())
                    .label(entry.getKey())
                    .value(entry.getValue())
                    .build());
        }

        return items;
    }

    private static String provisioningLabel(String status) {
        return switch (status) {
            case "PENDING" -> "Pendente";
            case "PROVISIONING" -> "Em andamento";
            case "READY" -> "Pronto";
            case "ERROR" -> "Erro";
            case "SUSPENDED" -> "Suspenso";
            default -> status;
        };
    }
}
