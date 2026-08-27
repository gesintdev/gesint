package br.com.gommo.core.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import br.com.gommo.core.branch.BranchContextHolder;
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
                List<SimpleGrantedAuthority> authorities = resolveAuthorities(claims);
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
     * As authorities do request sao as da filial ativa, e nao a uniao de todas.
     *
     * E isso que permite o mesmo usuario ser admin de RH numa filial e apenas consultar ponto em
     * outra sem tocar em nenhum dos {@code @PreAuthorize} espalhados pelos services: eles
     * continuam perguntando por uma authority simples, que agora ja chega escopada.
     *
     * Filial pedida a qual o usuario nao tem acesso resulta em nenhuma authority, e o proprio
     * enforcement existente nega a operacao.
     *
     * O claim {@code permissions} e a base: vale para toda filial acessivel que nao aparece em
     * {@code branchPermissions}, que so lista as excecoes. Sem isso o token repetiria o catalogo
     * inteiro de permissoes uma vez por filial.
     */
    @SuppressWarnings("unchecked")
    private List<SimpleGrantedAuthority> resolveAuthorities(Claims claims) {
        List<String> basePermissions = claims.get("permissions", List.class);
        Map<String, List<String>> overrides = claims.get(JwtService.CLAIM_BRANCH_PERMISSIONS, Map.class);
        List<String> branchIds = claims.get(JwtService.CLAIM_BRANCH_IDS, List.class);
        UUID activeBranch = BranchContextHolder.getOptional().orElse(null);

        String key = activeBranch == null ? JwtService.BRANCH_INDEPENDENT_KEY : activeBranch.toString();
        List<String> permissions;
        if (activeBranch != null && branchIds != null && !branchIds.contains(key)) {
            // Filial fora do acesso do usuario: nenhuma authority.
            permissions = List.of();
        } else if (overrides != null && overrides.containsKey(key)) {
            permissions = overrides.get(key);
        } else {
            permissions = basePermissions;
        }

        return permissions == null
                ? List.of()
                : permissions.stream().map(SimpleGrantedAuthority::new).toList();
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
