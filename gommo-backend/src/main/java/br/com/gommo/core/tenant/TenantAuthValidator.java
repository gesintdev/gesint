package br.com.gommo.core.tenant;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class TenantAuthValidator {

    private final MultiTenantProperties properties;
    private final TenantClientUserLookup tenantClientUserLookup;
    private final PlatformAdminUserLookup platformAdminUserLookup;

    public TenantAuthValidator(
            MultiTenantProperties properties,
            TenantClientUserLookup tenantClientUserLookup,
            PlatformAdminUserLookup platformAdminUserLookup) {
        this.properties = properties;
        this.tenantClientUserLookup = tenantClientUserLookup;
        this.platformAdminUserLookup = platformAdminUserLookup;
    }

    public void assertLoginAllowed(UUID appUserId, String username) {
        if (!properties.isEnabled()) {
            return;
        }
        TenantContext tenant = TenantContextHolder.require();
        if (tenant.isPlatformAccess()) {
            if (platformAdminUserLookup.isPlatformAdmin(username)) {
                return;
            }
            if (tenantClientUserLookup.isBoundToAnyClient(appUserId)) {
                throw TenantException.hostRequired();
            }
            throw TenantException.mismatch();
        }
        if (!tenantClientUserLookup.belongsToTenant(appUserId, tenant.clientId())) {
            throw TenantException.mismatch();
        }
    }

    public void assertUserBelongsToCurrentTenant(UUID appUserId) {
        if (!properties.isEnabled()) {
            return;
        }
        TenantContext tenant = TenantContextHolder.require();
        if (tenant.isPlatformAccess()) {
            if (platformAdminUserLookup.isPlatformAdminAppUser(appUserId)) {
                return;
            }
            if (tenantClientUserLookup.isBoundToAnyClient(appUserId)) {
                throw TenantException.hostRequired();
            }
            return;
        }
        if (!tenantClientUserLookup.belongsToTenant(appUserId, tenant.clientId())) {
            throw TenantException.mismatch();
        }
    }

    public void assertTokenMatchesCurrentTenant(UUID tokenTenantId) {
        if (!properties.isEnabled()) {
            return;
        }
        TenantContext tenant = TenantContextHolder.require();
        if (tenant.isPlatformAccess()) {
            if (tokenTenantId != null) {
                throw TenantException.hostRequired();
            }
            return;
        }
        if (tokenTenantId == null || !tokenTenantId.equals(tenant.clientId())) {
            throw TenantException.mismatch();
        }
    }
}
