package br.com.gommo.core.http;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * RestClient padrao com propagacao de X-Correlation-ID e X-Tenant-Slug do request atual.
 */
@Configuration
public class OutboundHttpClientConfig {

    private final OutboundRequestHeaders outboundRequestHeaders;

    public OutboundHttpClientConfig(OutboundRequestHeaders outboundRequestHeaders) {
        this.outboundRequestHeaders = outboundRequestHeaders;
    }

    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder().requestInterceptor((request, body, execution) -> {
            outboundRequestHeaders.resolve().forEach(request.getHeaders()::set);
            return execution.execute(request, body);
        });
    }
}
