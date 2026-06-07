package br.com.gommo.core.tenant;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class TenantAuthValidator {

    private final MultiTenantProperties properties;
    private final TenantClientUserLookup tenantClientUserLookup;

    public TenantAuthValidator(MultiTenantProperties properties, TenantClientUserLookup tenantClientUserLookup) {
        this.properties = properties;
        this.tenantClientUserLookup = tenantClientUserLookup;
    }

    public void assertUserBelongsToCurrentTenant(UUID appUserId) {
        if (!properties.isEnabled()) {
            return;
        }
        TenantContext tenant = TenantContextHolder.require();
        if (!tenantClientUserLookup.belongsToTenant(appUserId, tenant.clientId())) {
            throw TenantException.mismatch();
        }
    }

    public void assertTokenMatchesCurrentTenant(UUID tokenTenantId) {
        if (!properties.isEnabled()) {
            return;
        }
        TenantContext tenant = TenantContextHolder.require();
        if (tokenTenantId == null || !tokenTenantId.equals(tenant.clientId())) {
            throw TenantException.mismatch();
        }
    }
}
