package br.com.gommo.modules.rh.person.jobvacancyapplication.scheduler;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import br.com.gommo.core.tenant.AdminClientLookup;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.modules.rh.person.jobvacancyapplication.service.JobVacancyApplicationKanbanSlaReminderService;

@Component
public class JobVacancyApplicationKanbanSlaScheduler {

    private static final Logger log = LoggerFactory.getLogger(JobVacancyApplicationKanbanSlaScheduler.class);

    private final AdminClientLookup adminClientLookup;
    private final JobVacancyApplicationKanbanSlaReminderService reminderService;

    public JobVacancyApplicationKanbanSlaScheduler(
            AdminClientLookup adminClientLookup, JobVacancyApplicationKanbanSlaReminderService reminderService) {
        this.adminClientLookup = adminClientLookup;
        this.reminderService = reminderService;
    }

    @Scheduled(cron = "${gommo.recruiting.kanban-sla.cron:0 0 8 * * *}", zone = "America/Sao_Paulo")
    public void runDailyReminders() {
        List<TenantContext> tenants = adminClientLookup.findAllReadyTenants();
        for (TenantContext tenant : tenants) {
            TenantContextHolder.set(tenant);
            try {
                reminderService.processDailyReminders();
            } catch (Exception ex) {
                log.warn("Kanban SLA reminder failed for tenant {}: {}", tenant.slug(), ex.getMessage());
            } finally {
                TenantContextHolder.clear();
            }
        }
    }
}
