package br.com.gommo.core.http;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import br.com.gommo.core.security.CorrelationIdFilter;
import br.com.gommo.core.tenant.MultiTenantProperties;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;

/**
 * Monta headers de contexto para chamadas HTTP de saida (tenant, correlation id).
 * Use via {@link OutboundHttpClientConfig#restClientBuilder()} em vez de RestClient/WebClient direto.
 */
@Component
public class OutboundRequestHeaders {

    private final MultiTenantProperties multiTenantProperties;

    public OutboundRequestHeaders(MultiTenantProperties multiTenantProperties) {
        this.multiTenantProperties = multiTenantProperties;
    }

    public Map<String, String> resolve() {
        Map<String, String> headers = new LinkedHashMap<>();

        String correlationId = Optional.ofNullable(MDC.get(CorrelationIdFilter.MDC_KEY))
                .filter(value -> !value.isBlank())
                .orElse(null);
        if (correlationId != null) {
            headers.put(CorrelationIdFilter.HEADER, correlationId);
        }

        if (multiTenantProperties.isEnabled()) {
            TenantContextHolder.getOptional()
                    .filter(tenant -> !tenant.isPlatformAccess())
                    .map(TenantContext::slug)
                    .filter(slug -> slug != null && !slug.isBlank())
                    .ifPresent(slug -> headers.put(multiTenantProperties.getTenantHeader(), slug));
        }

        return headers;
    }
}
