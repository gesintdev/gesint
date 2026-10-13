package br.com.gommo.modules.rh.person.experience.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import br.com.gommo.core.tenant.AdminClientLookup;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.modules.rh.person.experience.service.IExperienceEvaluationService;

@Component
public class ExperienceEvaluationDueScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExperienceEvaluationDueScheduler.class);

    private final AdminClientLookup adminClientLookup;
    private final IExperienceEvaluationService experienceEvaluationService;

    public ExperienceEvaluationDueScheduler(
            AdminClientLookup adminClientLookup, IExperienceEvaluationService experienceEvaluationService) {
        this.adminClientLookup = adminClientLookup;
        this.experienceEvaluationService = experienceEvaluationService;
    }

    @Scheduled(cron = "${gommo.experience.due.cron:0 15 8 * * *}", zone = "America/Sao_Paulo")
    public void runDailyDueProcessing() {
        for (TenantContext tenant : adminClientLookup.findAllReadyTenants()) {
            TenantContextHolder.set(tenant);
            try {
                experienceEvaluationService.processDailyDueDates();
            } catch (Exception ex) {
                log.warn(
                        "Experience due processing failed for tenant {}: {}",
                        tenant.slug(),
                        ex.getMessage());
            } finally {
                TenantContextHolder.clear();
            }
        }
    }
}
