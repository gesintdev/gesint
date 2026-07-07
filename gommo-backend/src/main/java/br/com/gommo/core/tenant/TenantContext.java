package br.com.gommo.core.tenant;

import java.util.UUID;

public record TenantContext(
        UUID clientId,
        String slug,
        String schema,
        String name,
        TenantProvisioningStatus provisioningStatus,
        String billingStatus) {

    private static final UUID DEVELOPMENT_PUBLIC_CLIENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    public static TenantContext platform() {
        return new TenantContext(null, null, "public", "Platform", TenantProvisioningStatus.READY, null);
    }

    public static TenantContext developmentPublic(String slug) {
        String tenantSlug = slug == null || slug.isBlank() ? "dev-public" : slug.trim();
        return new TenantContext(
                DEVELOPMENT_PUBLIC_CLIENT_ID,
                tenantSlug,
                "public",
                "Development Public",
                TenantProvisioningStatus.READY,
                null);
    }

    public boolean isPlatformAccess() {
        return clientId == null;
    }

    public boolean isBillingActive() {
        return billingStatus == null || "ACTIVE".equalsIgnoreCase(billingStatus);
    }
}