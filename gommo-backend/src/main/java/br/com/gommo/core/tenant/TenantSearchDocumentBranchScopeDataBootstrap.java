package br.com.gommo.core.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class TenantSearchDocumentBranchScopeDataBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TenantSearchDocumentBranchScopeDataBootstrap.class);

    private final TenantSearchDocumentBranchScopeDataRepair repair;
    private final boolean enabled;

    public TenantSearchDocumentBranchScopeDataBootstrap(
            TenantSearchDocumentBranchScopeDataRepair repair,
            @Value("${gommo.tenant-schema.repair-search-document-branch-scope-on-startup:true}") boolean enabled) {
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
                    "Reparo de escopo por filial em search_document: {} schema(s) de tenant atualizado(s).",
                    repairedSchemas);
        }
    }
}
