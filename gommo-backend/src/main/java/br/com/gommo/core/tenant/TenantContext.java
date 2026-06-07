package br.com.gommo.core.tenant;

import java.util.UUID;

public record TenantContext(
        UUID clientId,
        String slug,
        String schema,
        String name,
        TenantProvisioningStatus provisioningStatus,
        String billingStatus) {

    public boolean isBillingActive() {
        return billingStatus == null || "ACTIVE".equalsIgnoreCase(billingStatus);
    }
}
