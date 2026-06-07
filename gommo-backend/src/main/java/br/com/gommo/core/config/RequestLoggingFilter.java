package br.com.gommo.core.config;

import br.com.gommo.core.tenant.TenantResolutionFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            String tenantSlug = null;
            String tenantSchema = null;
            Object tenantContext = request.getAttribute(TenantResolutionFilter.REQUEST_ATTR);
            if (tenantContext instanceof br.com.gommo.core.tenant.TenantContext tenant) {
                tenantSlug = tenant.slug();
                tenantSchema = tenant.schema();
            }
            log.info(
                    "method={} path={} status={} durationMs={} tenant={} schema={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    duration,
                    tenantSlug,
                    tenantSchema);
        }
    }
}
