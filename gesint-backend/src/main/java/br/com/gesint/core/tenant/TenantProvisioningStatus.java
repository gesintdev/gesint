package br.com.gesint.core.tenant;

public enum TenantProvisioningStatus {
    PENDING,
    PROVISIONING,
    READY,
    ERROR,
    SUSPENDED;

    public static TenantProvisioningStatus fromDatabase(String value) {
        if (value == null || value.isBlank()) {
            return PENDING;
        }
        return TenantProvisioningStatus.valueOf(value.trim().toUpperCase());
    }
}
