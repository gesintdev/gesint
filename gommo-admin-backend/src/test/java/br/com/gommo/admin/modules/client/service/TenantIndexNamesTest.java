package br.com.gommo.admin.modules.client.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class TenantIndexNamesTest {

    @Test
    void keepsShortNamesUnchanged() {
        String name = TenantIndexNames.unique("uk", "tenant_acme", "permission_code");
        assertEquals("uk_tenant_acme_permission_code", name);
    }

    @Test
    void shortensLongSchemaWithoutCollidingSuffixes() {
        String schema = "tenant_laura_emily_avelar_heymbeeck_milhomem_70911739106";
        String code = TenantIndexNames.unique("uk", schema, "permission_code");
        String authority = TenantIndexNames.unique("uk", schema, "permission_authority");

        assertTrue(code.length() <= 63);
        assertTrue(authority.length() <= 63);
        assertNotEquals(code, authority);
        assertTrue(code.endsWith("permission_code"));
        assertTrue(authority.endsWith("permission_authority"));
    }
}
