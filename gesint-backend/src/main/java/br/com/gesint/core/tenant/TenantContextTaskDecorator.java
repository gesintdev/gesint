package br.com.gesint.core.tenant;

import java.util.Map;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.core.task.TaskDecorator;

import br.com.gesint.core.branch.BranchContextHolder;

/**
 * Propagates {@link TenantContext}, active branch and MDC to async worker threads.
 * Required for schema-per-tenant isolation and branch scoping when using @Async.
 */
public class TenantContextTaskDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
        UUID branchId = BranchContextHolder.getOptional().orElse(null);
        Map<String, String> mdc = MDC.getCopyOfContextMap();
        return () -> {
            try {
                if (branchId != null) {
                    BranchContextHolder.set(branchId);
                }
                if (tenant != null) {
                    TenantContextHolder.set(tenant);
                    if (tenant.slug() != null) {
                        MDC.put(TenantResolutionFilter.MDC_TENANT_SLUG, tenant.slug());
                    }
                    if (tenant.schema() != null) {
                        MDC.put(TenantResolutionFilter.MDC_TENANT_SCHEMA, tenant.schema());
                    }
                }
                if (mdc != null) {
                    MDC.setContextMap(mdc);
                }
                runnable.run();
            } finally {
                TenantContextHolder.clear();
                BranchContextHolder.clear();
                MDC.clear();
            }
        };
    }
}
