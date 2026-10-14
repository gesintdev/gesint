package br.com.gommo.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public static final String CLAIM_TENANT_ID = "tenantId";
    public static final String CLAIM_TENANT_SLUG = "tenantSlug";
    /** Distingue sessao de colaborador/staff da sessao do portal do candidato. */
    public static final String CLAIM_PRINCIPAL = "principal";
    public static final String PRINCIPAL_STAFF = "staff";
    public static final String PRINCIPAL_CANDIDATE = "candidate";
    public static final String TYPE_CANDIDATE_REFRESH = "candidate_refresh";
    /**
     * Excecoes de permissao por filial: {@code {"<branchId>": ["payroll:read", ...]}}.
     *
     * Guarda apenas as filiais cujo conjunto difere do claim {@code permissions}, que funciona
     * como base. Repetir a lista inteira em cada filial multiplicava o tamanho do token e
     * estourava o limite do cookie de sessao para usuarios com muitas permissoes.
     *
     * A chave {@link #BRANCH_INDEPENDENT_KEY} guarda as permissoes que valem sem filial escolhida
     * (agenda, ponto proprio, storage), usadas enquanto o usuario ainda nao selecionou uma.
     */
    public static final String CLAIM_BRANCH_PERMISSIONS = "branchPermissions";

    /** Filiais a que o usuario tem acesso. Filial fora desta lista nao recebe authority alguma. */
    public static final String CLAIM_BRANCH_IDS = "branchIds";

    public static final String BRANCH_INDEPENDENT_KEY = "*";
    private static final ZoneId SESSION_ZONE = ZoneId.of("America/Sao_Paulo");

    private final JwtProperties properties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        String secret = properties.secret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET nao configurado. Defina um segredo com no minimo 32 caracteres.");
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET muito curto (" + keyBytes.length
                            + " bytes). Use no minimo 32 caracteres (ex.: openssl rand -base64 32).");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(
            UUID userId,
            String username,
            List<String> permissions,
            UUID tenantId,
            String tenantSlug,
            Map<String, List<String>> branchPermissionOverrides,
            List<String> branchIds) {
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
        if (branchPermissionOverrides != null && !branchPermissionOverrides.isEmpty()) {
            builder.claim(CLAIM_BRANCH_PERMISSIONS, new LinkedHashMap<>(branchPermissionOverrides));
        }
        if (branchIds != null && !branchIds.isEmpty()) {
            builder.claim(CLAIM_BRANCH_IDS, branchIds);
        }
        applyTenantClaims(builder, tenantId, tenantSlug);
        return builder.signWith(secretKey).compact();
    }

    public String generateAccessToken(
            UUID userId, String username, List<String> permissions, UUID tenantId, String tenantSlug) {
        return generateAccessToken(userId, username, permissions, tenantId, tenantSlug, null, null);
    }

    public String generateAccessToken(UUID userId, String username, List<String> permissions) {
        return generateAccessToken(userId, username, permissions, null, null, null, null);
    }

    public String generateRefreshToken(UUID userId, UUID tenantId, String tenantSlug) {
        Instant now = Instant.now();
        Instant expiry = nextSessionBoundary();
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

    /** Access token do portal do candidato: sem permissions de tenant, so principal=candidate. */
    public String generateCandidateAccessToken(
            UUID accountId, String email, UUID tenantId, String tenantSlug) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.accessTokenMinutes() * 60);
        var builder = Jwts.builder()
                .subject(accountId.toString())
                .claim("username", email)
                .claim("permissions", List.of())
                .claim("type", "access")
                .claim(CLAIM_PRINCIPAL, PRINCIPAL_CANDIDATE)
                .claim("jti", UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry));
        applyTenantClaims(builder, tenantId, tenantSlug);
        return builder.signWith(secretKey).compact();
    }

    public String generateCandidateRefreshToken(UUID accountId, UUID tenantId, String tenantSlug) {
        Instant now = Instant.now();
        Instant expiry = nextSessionBoundary();
        var builder = Jwts.builder()
                .subject(accountId.toString())
                .claim("type", TYPE_CANDIDATE_REFRESH)
                .claim(CLAIM_PRINCIPAL, PRINCIPAL_CANDIDATE)
                .claim("jti", UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry));
        applyTenantClaims(builder, tenantId, tenantSlug);
        return builder.signWith(secretKey).compact();
    }

    public boolean isCandidateAccessToken(Claims claims) {
        return PRINCIPAL_CANDIDATE.equals(claims.get(CLAIM_PRINCIPAL, String.class))
                && "access".equals(claims.get("type", String.class));
    }

    public boolean isCandidateRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return PRINCIPAL_CANDIDATE.equals(claims.get(CLAIM_PRINCIPAL, String.class))
                    && TYPE_CANDIDATE_REFRESH.equals(claims.get("type", String.class));
        } catch (io.jsonwebtoken.JwtException ex) {
            return false;
        }
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

    private Instant nextSessionBoundary() {
        return ZonedDateTime.now(SESSION_ZONE)
                .toLocalDate()
                .plusDays(1)
                .atStartOfDay(SESSION_ZONE)
                .toInstant();
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
