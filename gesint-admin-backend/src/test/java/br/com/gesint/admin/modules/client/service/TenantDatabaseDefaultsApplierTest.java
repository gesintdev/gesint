package br.com.gesint.admin.modules.client.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import br.com.gesint.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gesint.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

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
    void applyKeepsConfiguredSchemaFromEnvironmentTable() {
        ClientEnvironmentConfig config = ClientEnvironmentConfig.builder()
                .databaseStrategy(TenantDatabaseStrategyEnum.DEDICATED_SCHEMA)
                .databaseSchema("posto_sjb")
                .subdomain("posto-sjb")
                .build();

        applier.apply(config, "posto-sao-joao-batista-ii");

        assertEquals("posto_sjb", config.getDatabaseSchema());
    }

    @Test
    void applyFillsDefaultSchemaOnlyWhenBlank() {
        ClientEnvironmentConfig config = ClientEnvironmentConfig.builder()
                .databaseStrategy(TenantDatabaseStrategyEnum.DEDICATED_SCHEMA)
                .databaseSchema(null)
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
