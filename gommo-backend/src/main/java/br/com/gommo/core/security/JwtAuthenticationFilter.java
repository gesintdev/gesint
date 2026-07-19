package br.com.gommo.core.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.core.tenant.MultiTenantProperties;
import br.com.gommo.core.tenant.TenantAuthValidator;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.core.tenant.TenantHttpResponses;
import br.com.gommo.core.tenant.TenantSchemaNames;
import br.com.gommo.modules.root.exception.AuthException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final MultiTenantProperties multiTenantProperties;
    private final TenantAuthValidator tenantAuthValidator;
    private final TenantHttpResponses tenantHttpResponses;
    private final JdbcTemplate jdbcTemplate;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            MultiTenantProperties multiTenantProperties,
            TenantAuthValidator tenantAuthValidator,
            TenantHttpResponses tenantHttpResponses,
            JdbcTemplate jdbcTemplate) {
        this.jwtService = jwtService;
        this.multiTenantProperties = multiTenantProperties;
        this.tenantAuthValidator = tenantAuthValidator;
        this.tenantHttpResponses = tenantHttpResponses;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtService.parseClaims(token);
                if (!"access".equals(claims.get("type", String.class))) {
                    filterChain.doFilter(request, response);
                    return;
                }
                UUID userId = UUID.fromString(claims.getSubject());
                if (multiTenantProperties.isEnabled()) {
                    UUID tokenTenantId = jwtService.extractTenantId(token).orElse(null);
                    tenantAuthValidator.assertTokenMatchesCurrentTenant(tokenTenantId, userId);
                    if (isTenantSessionRevoked(userId)) {
                        SecurityContextHolder.clearContext();
                        tenantHttpResponses.writeBusinessError(request, response, AuthException.revokedRefresh());
                        return;
                    }
                }
                @SuppressWarnings("unchecked")
                List<String> permissions = claims.get("permissions", List.class);
                List<SimpleGrantedAuthority> authorities = permissions == null
                        ? List.of()
                        : permissions.stream().map(SimpleGrantedAuthority::new).toList();
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (BusinessException ex) {
                SecurityContextHolder.clearContext();
                tenantHttpResponses.writeBusinessError(request, response, ex);
                return;
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }

    /**
     * Após FORCE_LOGOUT todos os refresh tokens do tenant ficam revogados.
     * Consulta schema-qualified para não depender do search_path do JPA no filtro.
     */
    private boolean isTenantSessionRevoked(UUID userId) {
        TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
        if (tenant == null || tenant.clientId() == null || tenant.isPlatformAccess()) {
            return false;
        }
        String schema = TenantSchemaNames.requireSafe(tenant.schema());
        Integer active = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM "%s".refresh_token
                WHERE user_id = ?
                  AND revoked = false
                  AND expires_at > ?
                """
                        .formatted(schema),
                Integer.class,
                userId,
                OffsetDateTime.now());
        return active == null || active == 0;
    }
}
