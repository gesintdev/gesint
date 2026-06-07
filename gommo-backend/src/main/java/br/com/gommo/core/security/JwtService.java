package br.com.gommo.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public static final String CLAIM_TENANT_ID = "tenantId";
    public static final String CLAIM_TENANT_SLUG = "tenantSlug";

    private final JwtProperties properties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.secretKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(
            UUID userId, String username, List<String> permissions, UUID tenantId, String tenantSlug) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.accessTokenMinutes() * 60);
        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim("username", username)
                .claim("permissions", permissions)
                .claim("type", "access")
                .claim("jti", UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry));
        applyTenantClaims(builder, tenantId, tenantSlug);
        return builder.signWith(secretKey).compact();
    }

    public String generateAccessToken(UUID userId, String username, List<String> permissions) {
        return generateAccessToken(userId, username, permissions, null, null);
    }

    public String generateRefreshToken(UUID userId, UUID tenantId, String tenantSlug) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.refreshTokenDays() * 24 * 60 * 60);
        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim("type", "refresh")
                .claim("jti", UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry));
        applyTenantClaims(builder, tenantId, tenantSlug);
        return builder.signWith(secretKey).compact();
    }

    public String generateRefreshToken(UUID userId) {
        return generateRefreshToken(userId, null, null);
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public Optional<UUID> extractTenantId(String token) {
        try {
            String value = parseClaims(token).get(CLAIM_TENANT_ID, String.class);
            if (value == null || value.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(UUID.fromString(value));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(parseClaims(token).get("type", String.class));
        } catch (io.jsonwebtoken.JwtException ex) {
            return false;
        }
    }

    private static void applyTenantClaims(io.jsonwebtoken.JwtBuilder builder, UUID tenantId, String tenantSlug) {
        if (tenantId != null) {
            builder.claim(CLAIM_TENANT_ID, tenantId.toString());
        }
        if (tenantSlug != null && !tenantSlug.isBlank()) {
            builder.claim(CLAIM_TENANT_SLUG, tenantSlug);
        }
    }
}
