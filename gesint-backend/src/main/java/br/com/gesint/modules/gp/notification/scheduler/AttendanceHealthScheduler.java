package br.com.gesint.modules.gp.notification.scheduler;

import java.time.LocalDate;
import java.util.function.Consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import br.com.gesint.core.tenant.AdminClientLookup;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.modules.gp.attendance.service.AttendanceEvaluationService;
import br.com.gesint.modules.gp.notification.service.AttendanceHealthService;

/** Jobs da saude do ponto, um tenant por vez (mesmo padrao do lembrete de SLA do kanban). */
@Component
public class AttendanceHealthScheduler {

    private static final Logger log = LoggerFactory.getLogger(AttendanceHealthScheduler.class);

    private final AdminClientLookup adminClientLookup;
    private final AttendanceHealthService healthService;

    public AttendanceHealthScheduler(AdminClientLookup adminClientLookup, AttendanceHealthService healthService) {
        this.adminClientLookup = adminClientLookup;
        this.healthService = healthService;
    }

    /** Resumo do dia anterior: pendencias e limites da CLT. */
    @Scheduled(cron = "${gesint.attendance.health.cron:0 30 7 * * *}", zone = "America/Sao_Paulo")
    public void runDailyHealth() {
        LocalDate yesterday = LocalDate.now(AttendanceEvaluationService.BUSINESS_ZONE).minusDays(1);
        forEachTenant("saude do ponto", tenant -> healthService.processDailyHealth(yesterday));
    }

    /** Aviso preventivo: perto de 10 horas e de 6 horas sem intervalo. */
    @Scheduled(cron = "${gesint.attendance.near-limits.cron:0 */15 5-23 * * *}", zone = "America/Sao_Paulo")
    public void runNearLimits() {
        forEachTenant("limites do dia", tenant -> healthService.processNearLimits());
    }

    private void forEachTenant(String job, Consumer<TenantContext> action) {
        for (TenantContext tenant : adminClientLookup.findAllReadyTenants()) {
            TenantContextHolder.set(tenant);
            try {
                action.accept(tenant);
            } catch (Exception ex) {
                log.warn("Job de {} falhou no tenant {}: {}", job, tenant.slug(), ex.getMessage());
            } finally {
                TenantContextHolder.clear();
            }
        }
    }
}
