package br.com.gommo.core.tenant;

import java.util.UUID;

public record TenantContext(
        UUID clientId,
        String slug,
        String schema,
        String name,
        TenantProvisioningStatus provisioningStatus,
        String billingStatus) {

    public static TenantContext platform() {
        return new TenantContext(null, null, "public", "Platform", TenantProvisioningStatus.READY, null);
    }

    public boolean isPlatformAccess() {
        return clientId == null;
    }

    public boolean isBillingActive() {
        return billingStatus == null || "ACTIVE".equalsIgnoreCase(billingStatus);
    }
}
