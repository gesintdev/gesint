package br.com.gommo.core.tenant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.gommo.core.exception.BusinessException;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TenantResolverTest {

    @Mock
    private AdminClientLookup adminClientLookup;

    private MultiTenantProperties properties;
    private TenantResolver resolver;

    @BeforeEach
    void setUp() {
        properties = new MultiTenantProperties();
        properties.setEnabled(true);
        properties.setBaseDomain("localhost");
        properties.setProductionBaseDomain("gommo.com.br");
        resolver = new TenantResolver(properties, new TenantHostParser(), adminClientLookup);
    }

    @Test
    void resolvesBySubdomainWhenReady() {
        TenantContext context = readyTenant("empresa-a", "tenant_empresa_a");
        when(adminClientLookup.findBySubdomain("empresa-a")).thenReturn(Optional.of(context));

        Optional<TenantContext> resolved = resolver.resolve("empresa-a.localhost:8081", null);

        assertThat(resolved).contains(context);
    }

    @Test
    void resolvesDevFallbackOnBareLocalhost() {
        properties.setDevTenantSlug("empresa-a");
        TenantContext context = readyTenant("empresa-a", "tenant_empresa_a");
        when(adminClientLookup.findBySlug("empresa-a")).thenReturn(Optional.of(context));

        Optional<TenantContext> resolved = resolver.resolve("localhost:8081", null);

        assertThat(resolved).contains(context);
    }

    @Test
    void resolvesByHeaderWhenEnabled() {
        properties.setHeaderEnabled(true);
        TenantContext context = readyTenant("empresa-b", "tenant_empresa_b");
        when(adminClientLookup.findBySlug("empresa-b")).thenReturn(Optional.of(context));

        Optional<TenantContext> resolved = resolver.resolve("localhost:8081", "empresa-b");

        assertThat(resolved).contains(context);
    }

    @Test
    void rejectsPendingProvisioning() {
        TenantContext pending = new TenantContext(
                UUID.randomUUID(),
                "empresa-a",
                "tenant_empresa_a",
                "Empresa A",
                TenantProvisioningStatus.PENDING,
                "ACTIVE");
        when(adminClientLookup.findBySubdomain("empresa-a")).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> resolver.resolve("empresa-a.localhost", null))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(TenantExceptions.NOT_READY_CODE);
    }

    @Test
    void disabledResolverReturnsEmpty() {
        properties.setEnabled(false);

        assertThat(resolver.resolve("empresa-a.localhost", null)).isEmpty();
    }

    private static TenantContext readyTenant(String slug, String schema) {
        return new TenantContext(
                UUID.randomUUID(), slug, schema, "Tenant " + slug, TenantProvisioningStatus.READY, "ACTIVE");
    }
}
