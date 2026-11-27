package br.com.gesint.modules.cfg.settings.notification.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import br.com.gesint.core.tenant.AdminClientLookup;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.modules.cfg.settings.notification.service.SystemNotificationService;

/**
 * Gera as notificacoes do RH (ferias a vencer, ajustes de ponto pendentes) sem depender de alguem
 * abrir o sino. Antes elas so nasciam na leitura do sino.
 */
@Component
public class SystemNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(SystemNotificationScheduler.class);

    private final AdminClientLookup adminClientLookup;
    private final SystemNotificationService notificationService;

    public SystemNotificationScheduler(AdminClientLookup adminClientLookup, SystemNotificationService notificationService) {
        this.adminClientLookup = adminClientLookup;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "${gesint.notifications.refresh.cron:0 5 * * * *}", zone = "America/Sao_Paulo")
    public void refresh() {
        for (TenantContext tenant : adminClientLookup.findAllReadyTenants()) {
            TenantContextHolder.set(tenant);
            try {
                notificationService.refreshScheduledNotifications();
            } catch (Exception ex) {
                log.warn("Atualizacao de notificacoes falhou no tenant {}: {}", tenant.slug(), ex.getMessage());
            } finally {
                TenantContextHolder.clear();
            }
        }
    }
}
