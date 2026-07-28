package br.com.gommo.core.llm;

import java.util.Locale;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@Configuration
@EnableConfigurationProperties(LlmProperties.class)
public class LlmConfiguration {

    @Bean
    public LlmClient llmClient(
            LlmProperties properties,
            RestClient.Builder restClientBuilder,
            ObjectProvider<JsonMapper> jsonMapperProvider,
            LlmUsageTracker usageTracker) {
        ObjectMapper objectMapper =
                jsonMapperProvider.getIfAvailable(() -> JsonMapper.builder().build());
        String provider = StringUtils.hasText(properties.getProvider())
                ? properties.getProvider().trim().toLowerCase(Locale.ROOT)
                : "gemini";
        return switch (provider) {
            case "gemini" -> new GeminiLlmClient(properties, restClientBuilder, objectMapper, usageTracker);
            case "openai" -> new OpenAiLlmClient(properties, restClientBuilder, objectMapper, usageTracker);
            default -> throw LlmException.providerUnsupported(provider);
        };
    }
}
