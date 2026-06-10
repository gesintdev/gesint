package br.com.gommo.core.http;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import br.com.gommo.core.security.CorrelationIdFilter;
import br.com.gommo.core.tenant.MultiTenantProperties;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.core.tenant.TenantProvisioningStatus;

class OutboundRequestHeadersTest {

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
        MDC.remove(CorrelationIdFilter.MDC_KEY);
    }

    @Test
    void resolve_includesCorrelationAndTenantWhenPresent() {
        MultiTenantProperties properties = new MultiTenantProperties();
        properties.setEnabled(true);
        properties.setTenantHeader("X-Tenant-Slug");

        MDC.put(CorrelationIdFilter.MDC_KEY, "corr-123");
        TenantContextHolder.set(new TenantContext(
                UUID.randomUUID(),
                "empresa-a",
                "tenant_empresa_a",
                "Empresa A",
                TenantProvisioningStatus.READY,
                "ACTIVE"));

        OutboundRequestHeaders headers = new OutboundRequestHeaders(properties);

        assertThat(headers.resolve())
                .containsEntry(CorrelationIdFilter.HEADER, "corr-123")
                .containsEntry("X-Tenant-Slug", "empresa-a");
    }

    @Test
    void resolve_omitsTenantForPlatformAccess() {
        MultiTenantProperties properties = new MultiTenantProperties();
        properties.setEnabled(true);

        TenantContextHolder.set(TenantContext.platform());

        OutboundRequestHeaders headers = new OutboundRequestHeaders(properties);

        assertThat(headers.resolve()).doesNotContainKey("X-Tenant-Slug");
    }
}
