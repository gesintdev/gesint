package br.com.gommo.core.tenant;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.gommo.core.exception.BusinessException;

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
    void allowsTenantUserOnTenantHost() {
        UUID userId = UUID.randomUUID();
        TenantContextHolder.set(new TenantContext(
                UUID.randomUUID(), "empresa-a", "tenant_a", "A", TenantProvisioningStatus.READY, "ACTIVE"));

        validator.assertUserBelongsToCurrentTenant(userId);
    }

    @Test
    void allowsLocalSchemaUserOnTenantHostWithoutAdminLink() {
        UUID userId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        TenantContextHolder.set(
                new TenantContext(clientId, "empresa-a", "tenant_a", "A", TenantProvisioningStatus.READY, "ACTIVE"));
        when(platformAdminUserLookup.isPlatformAdmin("local-user")).thenReturn(false);
        when(platformAdminUserLookup.isPlatformAdminAppUser(userId)).thenReturn(false);
        when(tenantClientUserLookup.isLinkedToClient(clientId, userId)).thenReturn(false);

        validator.assertLoginAllowed(userId, "local-user");
    }

    @Test
    void allowsPlatformAdminOnPlatformHostEvenWhenRegisteredClientUsernameExists() {
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
        when(tenantClientUserLookup.isRegisteredClientUsername("client-admin")).thenReturn(true);

        assertThatThrownBy(() -> validator.assertLoginAllowed(userId, "client-admin"))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(TenantExceptions.HOST_REQUIRED_CODE);
    }

    @Test
    void allowsPlatformAdminTokenWithoutTenantOnTenantHost() {
        UUID userId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        TenantContextHolder.set(
                new TenantContext(clientId, "empresa-a", "tenant_a", "A", TenantProvisioningStatus.READY, "ACTIVE"));
        when(platformAdminUserLookup.isPlatformAdminAppUser(userId)).thenReturn(true);

        validator.assertTokenMatchesCurrentTenant(null, userId);
    }

    @Test
    void rejectsNonPlatformUserOnPlatformHost() {
        UUID userId = UUID.randomUUID();
        TenantContextHolder.set(TenantContext.platform());
        when(platformAdminUserLookup.isPlatformAdmin("guest")).thenReturn(false);
        when(tenantClientUserLookup.isRegisteredClientUsername("guest")).thenReturn(false);

        assertThatThrownBy(() -> validator.assertLoginAllowed(userId, "guest"))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(TenantExceptions.MISMATCH_CODE);
    }
}
