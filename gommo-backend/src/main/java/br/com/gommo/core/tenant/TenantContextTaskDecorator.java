package br.com.gommo.core.tenant;

import java.util.Map;
import org.slf4j.MDC;
import org.springframework.core.task.TaskDecorator;

/**
 * Propagates {@link TenantContext} and MDC to async worker threads.
 * Required for schema-per-tenant isolation when using @Async.
 */
public class TenantContextTaskDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
        Map<String, String> mdc = MDC.getCopyOfContextMap();
        return () -> {
            try {
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
                MDC.clear();
            }
        };
    }
}
