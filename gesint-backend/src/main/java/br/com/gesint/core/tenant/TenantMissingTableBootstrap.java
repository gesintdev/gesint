package br.com.gesint.core.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class TenantMissingTableBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TenantMissingTableBootstrap.class);

    private final TenantMissingTableRepair repair;
    private final boolean enabled;

    public TenantMissingTableBootstrap(
            TenantMissingTableRepair repair,
            @Value("${gesint.tenant-schema.repair-missing-tables-on-startup:true}") boolean enabled) {
        this.repair = repair;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        try {
            int repairedSchemas = repair.repairAllTenants();
            if (repairedSchemas > 0) {
                log.info("Reparo de tabelas ausentes: {} schema(s) de tenant atualizado(s).", repairedSchemas);
            }
        } catch (RuntimeException ex) {
            log.error("Reparo de tabelas ausentes falhou; a aplicacao segue no ar.", ex);
        }
    }
}
