package br.com.gesint.core.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class TenantAdmissionBranchScopeDataBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TenantAdmissionBranchScopeDataBootstrap.class);

    private final TenantAdmissionBranchScopeDataRepair repair;
    private final boolean enabled;

    public TenantAdmissionBranchScopeDataBootstrap(
            TenantAdmissionBranchScopeDataRepair repair,
            @Value("${gesint.tenant-schema.repair-admission-branch-scope-on-startup:true}") boolean enabled) {
        this.repair = repair;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        int repairedSchemas = repair.repairAllTenants();
        if (repairedSchemas > 0) {
            log.info(
                    "Reparo de escopo por filial na admissao: {} schema(s) de tenant atualizado(s).",
                    repairedSchemas);
        }
    }
}
