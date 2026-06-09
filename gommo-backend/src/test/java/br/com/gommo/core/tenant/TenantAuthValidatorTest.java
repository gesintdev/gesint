package br.com.gommo.core.tenant;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import br.com.gommo.core.exception.BusinessException;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantAuthValidatorTest {

    @Mock
    private TenantClientUserLookup tenantClientUserLookup;

    @Mock
    private PlatformAdminUserLookup platformAdminUserLookup;

    private MultiTenantProperties properties;
    private TenantAuthValidator validator;

    @BeforeEach
    void setUp() {
        properties = new MultiTenantProperties();
        properties.setEnabled(true);
        validator = new TenantAuthValidator(properties, tenantClientUserLookup, platformAdminUserLookup);
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    @Test
    void rejectsUserOutsideTenant() {
        UUID clientId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        TenantContextHolder.set(new TenantContext(clientId, "empresa-a", "tenant_a", "A", TenantProvisioningStatus.READY, "ACTIVE"));
        when(tenantClientUserLookup.belongsToTenant(userId, clientId)).thenReturn(false);

        assertThatThrownBy(() -> validator.assertUserBelongsToCurrentTenant(userId))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(TenantExceptions.MISMATCH_CODE);
    }

    @Test
    void allowsPlatformAdminOnPlatformHostEvenWhenBoundToClient() {
        UUID userId = UUID.randomUUID();
        TenantContextHolder.set(TenantContext.platform());
        when(platformAdminUserLookup.isPlatformAdmin("admin")).thenReturn(true);

        validator.assertLoginAllowed(userId, "admin");
    }

    @Test
    void rejectsClientUserOnPlatformHost() {
        UUID userId = UUID.randomUUID();
        TenantContextHolder.set(TenantContext.platform());
        when(platformAdminUserLookup.isPlatformAdmin("client-admin")).thenReturn(false);
        when(tenantClientUserLookup.isBoundToAnyClient(userId)).thenReturn(true);

        assertThatThrownBy(() -> validator.assertLoginAllowed(userId, "client-admin"))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(TenantExceptions.HOST_REQUIRED_CODE);
    }

    @Test
    void rejectsNonPlatformUserOnPlatformHost() {
        UUID userId = UUID.randomUUID();
        TenantContextHolder.set(TenantContext.platform());
        when(tenantClientUserLookup.isBoundToAnyClient(userId)).thenReturn(false);
        when(platformAdminUserLookup.isPlatformAdmin("guest")).thenReturn(false);

        assertThatThrownBy(() -> validator.assertLoginAllowed(userId, "guest"))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(TenantExceptions.MISMATCH_CODE);
    }
}
