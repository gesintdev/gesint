package br.com.gommo.core.tenant;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import br.com.gommo.core.exception.BusinessException;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantAuthValidatorTest {

    @Mock
    private TenantClientUserLookup tenantClientUserLookup;

    private MultiTenantProperties properties;
    private TenantAuthValidator validator;

    @BeforeEach
    void setUp() {
        properties = new MultiTenantProperties();
        properties.setEnabled(true);
        validator = new TenantAuthValidator(properties, tenantClientUserLookup);
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

        TenantContextHolder.clear();
    }
}
