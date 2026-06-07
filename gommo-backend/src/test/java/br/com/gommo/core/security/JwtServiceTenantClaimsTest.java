package br.com.gommo.core.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JwtServiceTenantClaimsTest {

    private final JwtService jwtService = new JwtService(new JwtProperties("test-jwt-secret-only-for-unit-tests-min-32-chars", 15, 7));

    @Test
    void accessTokenCarriesTenantClaims() {
        UUID userId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();

        String token = jwtService.generateAccessToken(userId, "admin", List.of("payroll:read"), tenantId, "empresa-a");

        assertThat(jwtService.extractTenantId(token)).contains(tenantId);
        assertThat(jwtService.parseClaims(token).get("tenantSlug", String.class)).isEqualTo("empresa-a");
    }

    @Test
    void refreshTokenCarriesTenantClaims() {
        UUID userId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();

        String token = jwtService.generateRefreshToken(userId, tenantId, "empresa-a");

        assertThat(jwtService.extractTenantId(token)).contains(tenantId);
        assertThat(jwtService.isRefreshToken(token)).isTrue();
    }
}
