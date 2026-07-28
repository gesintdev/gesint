package br.com.gommo.core.llm;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import br.com.gommo.core.exception.BusinessException;

public class OpenAiLlmClient implements LlmClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiLlmClient.class);

    private final LlmProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final LlmUsageTracker usageTracker;

    public OpenAiLlmClient(
            LlmProperties properties,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            LlmUsageTracker usageTracker) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.usageTracker = usageTracker;
        this.restClient = restClientBuilder.baseUrl(trimSlash(properties.getOpenaiBaseUrl())).build();
    }

    @Override
    public LlmResponse complete(LlmRequest request) {
        requireApiKey();
        String model = StringUtils.hasText(properties.getModel()) ? properties.getModel().trim() : "gpt-4o-mini";
        Map<String, Object> body = buildBody(request, model);
        try {
            String raw = restClient
                    .post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + properties.getApiKey().trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode response = parseJson(raw);
            String text = extractText(response);
            if (!StringUtils.hasText(text)) {
                throw LlmException.emptyResponse();
            }
            LlmTokenUsage usage = extractUsage(response);
            usageTracker.record(usage);
            return LlmResponse.builder()
                    .content(text.trim())
                    .provider("openai")
                    .model(model)
                    .usage(usage)
                    .build();
        } catch (BusinessException ex) {
            throw ex;
        } catch (RestClientException ex) {
            log.warn("OpenAI API call failed: {}", ex.getMessage());
            throw LlmException.callFailed(safeDetail(ex.getMessage()));
        } catch (RuntimeException ex) {
            log.warn("OpenAI API unexpected error: {}", ex.getMessage());
            throw LlmException.callFailed(safeDetail(ex.getMessage()));
        }
    }

    private LlmTokenUsage extractUsage(JsonNode response) {
        if (response == null) {
            return LlmTokenUsage.empty();
        }
        JsonNode usage = response.path("usage");
        if (usage.isMissingNode() || usage.isNull()) {
            return LlmTokenUsage.empty();
        }
        return LlmTokenUsage.of(
                usage.path("prompt_tokens").asInt(0),
                usage.path("completion_tokens").asInt(0),
                usage.path("total_tokens").asInt(0));
    }

    private JsonNode parseJson(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        try {
            return objectMapper.readTree(raw);
        } catch (JacksonException ex) {
            throw LlmException.callFailed("Resposta JSON inválida da OpenAI");
        }
    }

    private void requireApiKey() {
        if (!StringUtils.hasText(properties.getApiKey())) {
            throw LlmException.notConfigured();
        }
    }

    private Map<String, Object> buildBody(LlmRequest request, String model) {
        List<Map<String, String>> messages = new ArrayList<>();
        if (StringUtils.hasText(request.getSystemInstruction())) {
            messages.add(Map.of("role", "system", "content", request.getSystemInstruction().trim()));
        }
        for (LlmMessage message : request.getMessages() == null ? List.<LlmMessage>of() : request.getMessages()) {
            if (message == null || !StringUtils.hasText(message.getContent())) {
                continue;
            }
            String role = normalizeOpenAiRole(message.getRole());
            messages.add(Map.of("role", role, "content", message.getContent().trim()));
        }
        if (messages.isEmpty()
                || messages.stream().noneMatch(m -> "user".equals(m.get("role")) || "assistant".equals(m.get("role")))) {
            throw LlmException.callFailed("Nenhuma mensagem válida para enviar ao modelo");
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put(
                "temperature",
                request.getTemperature() != null ? request.getTemperature() : properties.getTemperature());
        body.put(
                "max_tokens",
                request.getMaxOutputTokens() != null
                        ? request.getMaxOutputTokens()
                        : properties.getMaxOutputTokens());
        return body;
    }

    private static String normalizeOpenAiRole(String role) {
        if (!StringUtils.hasText(role)) {
            return "user";
        }
        String normalized = role.trim().toLowerCase(Locale.ROOT);
        if ("assistant".equals(normalized) || "model".equals(normalized)) {
            return "assistant";
        }
        if ("system".equals(normalized)) {
            return "system";
        }
        return "user";
    }

    private String extractText(JsonNode response) {
        if (response == null) {
            return null;
        }
        JsonNode choices = response.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            return null;
        }
        return choices.get(0).path("message").path("content").asString(null);
    }

    private static String trimSlash(String value) {
        if (!StringUtils.hasText(value)) {
            return "https://api.openai.com/v1";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    private static String safeDetail(String detail) {
        if (!StringUtils.hasText(detail)) {
            return null;
        }
        String cleaned = detail.replaceAll("(?i)(key|token|authorization)=[^\\s&]+", "$1=***");
        return cleaned.length() > 180 ? cleaned.substring(0, 180) + "…" : cleaned;
    }
}
