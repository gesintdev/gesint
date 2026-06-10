package br.com.gommo.core.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.core.tenant.MultiTenantProperties;
import br.com.gommo.core.tenant.TenantAuthValidator;
import br.com.gommo.core.tenant.TenantHttpResponses;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final MultiTenantProperties multiTenantProperties;
    private final TenantAuthValidator tenantAuthValidator;
    private final TenantHttpResponses tenantHttpResponses;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            MultiTenantProperties multiTenantProperties,
            TenantAuthValidator tenantAuthValidator,
            TenantHttpResponses tenantHttpResponses) {
        this.jwtService = jwtService;
        this.multiTenantProperties = multiTenantProperties;
        this.tenantAuthValidator = tenantAuthValidator;
        this.tenantHttpResponses = tenantHttpResponses;
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
}
