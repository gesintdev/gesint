package br.com.gommo.admin.modules.client.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

class TenantDatabaseDefaultsApplierTest {

    private final TenantDatabaseDefaultsApplier applier = new TenantDatabaseDefaultsApplier(new MockEnvironment());

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

    @Test
    void applyCorrectsSchemaThatDoesNotMatchSlug() {
        ClientEnvironmentConfig config = ClientEnvironmentConfig.builder()
                .databaseStrategy(TenantDatabaseStrategyEnum.DEDICATED_SCHEMA)
                .databaseSchema("tenant_elaine")
                .build();

        applier.apply(config, "teste");

        assertEquals("tenant_teste", config.getDatabaseSchema());
    }

    @Test
    void applyKeepsSchemaAlignedWithSlug() {
        ClientEnvironmentConfig config = ClientEnvironmentConfig.builder()
                .databaseStrategy(TenantDatabaseStrategyEnum.DEDICATED_SCHEMA)
                .databaseSchema("tenant_laura")
                .build();

        applier.apply(config, "laura");

        assertEquals("tenant_laura", config.getDatabaseSchema());
    }
}
