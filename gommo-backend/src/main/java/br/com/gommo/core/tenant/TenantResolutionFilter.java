package br.com.gommo.core.tenant;

import br.com.gommo.core.exception.BusinessException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class TenantResolutionFilter extends OncePerRequestFilter {

    public static final String MDC_TENANT_SLUG = "tenantSlug";
    public static final String MDC_TENANT_SCHEMA = "tenantSchema";
    public static final String REQUEST_ATTR = "tenantContext";

    private final MultiTenantProperties properties;
    private final TenantResolver tenantResolver;
    private final TenantHttpResponses tenantHttpResponses;

    public TenantResolutionFilter(
            MultiTenantProperties properties,
            TenantResolver tenantResolver,
            TenantHttpResponses tenantHttpResponses) {
        this.properties = properties;
        this.tenantResolver = tenantResolver;
        this.tenantHttpResponses = tenantHttpResponses;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!properties.isEnabled()) {
            return true;
        }
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        if (path.startsWith("/actuator/health") || path.startsWith("/actuator/prometheus")) {
            return true;
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String headerValue = request.getHeader(properties.getTenantHeader());
            var tenant = tenantResolver.resolveRequired(request.getHeader("Host"), headerValue);
            TenantContextHolder.set(tenant);
            request.setAttribute(REQUEST_ATTR, tenant);
            MDC.put(MDC_TENANT_SLUG, tenant.slug());
            MDC.put(MDC_TENANT_SCHEMA, tenant.schema());
            filterChain.doFilter(request, response);
        } catch (BusinessException ex) {
            tenantHttpResponses.writeBusinessError(request, response, ex);
        } finally {
            MDC.remove(MDC_TENANT_SLUG);
            MDC.remove(MDC_TENANT_SCHEMA);
            TenantContextHolder.clear();
        }
    }
}
