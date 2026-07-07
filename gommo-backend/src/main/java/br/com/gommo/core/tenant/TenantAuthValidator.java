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
            if (tenantClientUserLookup.isRegisteredClientUsername(username)) {
                throw TenantException.hostRequired();
            }
            throw TenantException.mismatch();
        }
        if (platformAdminUserLookup.isPlatformAdmin(username)
                || platformAdminUserLookup.isPlatformAdminAppUser(appUserId)) {
            return;
        }
        if (tenantClientUserLookup.isLinkedToClient(tenant.clientId(), appUserId)) {
            return;
        }
        // The user was already loaded from the resolved tenant schema during login.
        return;
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
            return;
        }
        if (platformAdminUserLookup.isPlatformAdminAppUser(appUserId)) {
            return;
        }
    }

    public void assertTokenMatchesCurrentTenant(UUID tokenTenantId) {
        assertTokenMatchesCurrentTenant(tokenTenantId, null);
    }

    public void assertTokenMatchesCurrentTenant(UUID tokenTenantId, UUID appUserId) {
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
        if (tokenTenantId != null && tokenTenantId.equals(tenant.clientId())) {
            return;
        }
        if (tokenTenantId == null && appUserId != null && platformAdminUserLookup.isPlatformAdminAppUser(appUserId)) {
            return;
        }
        throw TenantException.mismatch();
    }
}
