package br.com.gommo.admin.modules.client.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class TenantDatabaseDefaultsApplierTest {

    @Test
    void keepsTypedSchemaInsteadOfReplacingWithSlug() {
        assertEquals("tenant_laura", TenantDatabaseDefaultsApplier.normalizeSchema("tenant_laura"));
        assertEquals("tenant_laura", TenantDatabaseDefaultsApplier.normalizeSchema("tenant-laura"));
        assertEquals("tenant_laura", TenantDatabaseDefaultsApplier.normalizeSchema(" Tenant.Laura "));
    }

    @Test
    void rejectsBlankAfterSanitize() {
        assertNull(TenantDatabaseDefaultsApplier.normalizeSchema("   "));
        assertNull(TenantDatabaseDefaultsApplier.normalizeSchema("---"));
    }

    @Test
    void capsLengthForPostgres() {
        String longName = "tenant_" + "a".repeat(80);
        String normalized = TenantDatabaseDefaultsApplier.normalizeSchema(longName);
        assertTrue(normalized.length() <= 63);
    }
}
