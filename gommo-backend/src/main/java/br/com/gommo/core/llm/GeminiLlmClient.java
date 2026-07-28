package br.com.gommo.core.llm;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import br.com.gommo.core.exception.BusinessException;

public class GeminiLlmClient implements LlmClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiLlmClient.class);

    private final LlmProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final LlmUsageTracker usageTracker;
    private volatile boolean modelLimitsLoaded;

    public GeminiLlmClient(
            LlmProperties properties,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            LlmUsageTracker usageTracker) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.usageTracker = usageTracker;
        this.restClient = restClientBuilder.baseUrl(trimSlash(properties.getGeminiBaseUrl())).build();
    }

    @Override
    public LlmResponse complete(LlmRequest request) {
        requireApiKey();
        ensureModelLimits();
        String model = StringUtils.hasText(properties.getModel())
                ? properties.getModel().trim()
                : "gemini-flash-lite-latest";
        Map<String, Object> body = buildBody(request);
        // Concatena o path para evitar ambiguidade de URI template com ":generateContent".
        String path = "/models/" + model + ":generateContent";
        try {
            String raw = restClient
                    .post()
                    .uri(path)
                    .header("x-goog-api-key", properties.getApiKey().trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        int status = res.getStatusCode().value();
                        if (status == 429) {
                            throw LlmException.quotaExceeded();
                        }
                        if (status == 404) {
                            throw LlmException.modelNotFound(model);
                        }
                        throw LlmException.callFailed("HTTP " + status);
                    })
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
                    .provider("gemini")
                    .model(model)
                    .usage(usage)
                    .build();
        } catch (BusinessException ex) {
            throw ex;
        } catch (RestClientException ex) {
            log.warn("Gemini API call failed: {}", ex.getMessage());
            String detail = safeDetail(ex.getMessage());
            if (detail != null && detail.contains("429")) {
                throw LlmException.quotaExceeded();
            }
            throw LlmException.callFailed(detail);
        } catch (RuntimeException ex) {
            log.warn("Gemini API unexpected error: {}", ex.getMessage());
            throw LlmException.callFailed(safeDetail(ex.getMessage()));
        }
    }

    private void ensureModelLimits() {
        if (modelLimitsLoaded) {
            return;
        }
        synchronized (this) {
            if (modelLimitsLoaded) {
                return;
            }
            String model = StringUtils.hasText(properties.getModel())
                    ? properties.getModel().trim()
                    : "gemini-flash-lite-latest";
            try {
                String raw = restClient
                        .get()
                        .uri("/models/{model}", model)
                        .header("x-goog-api-key", properties.getApiKey().trim())
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .body(String.class);
                JsonNode node = parseJson(raw);
                if (node != null) {
                    Integer input = readPositiveInt(node.path("inputTokenLimit"));
                    Integer output = readPositiveInt(node.path("outputTokenLimit"));
                    usageTracker.rememberModelLimits(input, output);
                }
            } catch (RuntimeException ex) {
                log.debug("Could not load Gemini model limits: {}", ex.getMessage());
            } finally {
                modelLimitsLoaded = true;
            }
        }
    }

    private LlmTokenUsage extractUsage(JsonNode response) {
        if (response == null) {
            return LlmTokenUsage.empty();
        }
        JsonNode meta = response.path("usageMetadata");
        if (meta.isMissingNode() || meta.isNull()) {
            return LlmTokenUsage.empty();
        }
        int prompt = meta.path("promptTokenCount").asInt(0);
        int completion = meta.path("candidatesTokenCount").asInt(0);
        int thoughts = meta.path("thoughtsTokenCount").asInt(0);
        int total = meta.path("totalTokenCount").asInt(0);
        return LlmTokenUsage.of(prompt, completion + thoughts, total);
    }

    private static Integer readPositiveInt(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        int value = node.asInt(0);
        return value > 0 ? value : null;
    }

    private JsonNode parseJson(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        try {
            return objectMapper.readTree(raw);
        } catch (JacksonException ex) {
            throw LlmException.callFailed("Resposta JSON inválida do Gemini");
        }
    }

    private void requireApiKey() {
        if (!StringUtils.hasText(properties.getApiKey())) {
            throw LlmException.notConfigured();
        }
    }

    private Map<String, Object> buildBody(LlmRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        if (StringUtils.hasText(request.getSystemInstruction())) {
            body.put(
                    "systemInstruction",
                    Map.of("parts", List.of(Map.of("text", request.getSystemInstruction().trim()))));
        }

        List<Map<String, Object>> contents = new ArrayList<>();
        for (LlmMessage message : request.getMessages() == null ? List.<LlmMessage>of() : request.getMessages()) {
            if (message == null || !StringUtils.hasText(message.getContent())) {
                continue;
            }
            String role = normalizeGeminiRole(message.getRole());
            if ("system".equals(role)) {
                continue;
            }
            contents.add(Map.of(
                    "role",
                    role,
                    "parts",
                    List.of(Map.of("text", message.getContent().trim()))));
        }
        if (contents.isEmpty()) {
            throw LlmException.callFailed("Nenhuma mensagem válida para enviar ao modelo");
        }
        body.put("contents", contents);

        double temperature =
                request.getTemperature() != null ? request.getTemperature() : properties.getTemperature();
        int maxTokens = request.getMaxOutputTokens() != null
                ? request.getMaxOutputTokens()
                : properties.getMaxOutputTokens();
        body.put(
                "generationConfig",
                Map.of(
                        "temperature", temperature,
                        "maxOutputTokens", maxTokens));
        return body;
    }

    private static String normalizeGeminiRole(String role) {
        if (!StringUtils.hasText(role)) {
            return "user";
        }
        String normalized = role.trim().toLowerCase(Locale.ROOT);
        if ("assistant".equals(normalized) || "model".equals(normalized)) {
            return "model";
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
        JsonNode candidates = response.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            JsonNode blockReason = response.path("promptFeedback").path("blockReason");
            if (!blockReason.isMissingNode()) {
                throw LlmException.callFailed("Bloqueado pelo provedor: " + blockReason.asString());
            }
            return null;
        }
        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (!parts.isArray()) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (JsonNode part : parts) {
            String text = part.path("text").asString(null);
            if (StringUtils.hasText(text)) {
                if (!sb.isEmpty()) {
                    sb.append('\n');
                }
                sb.append(text);
            }
        }
        return sb.toString();
    }

    private static String trimSlash(String value) {
        if (!StringUtils.hasText(value)) {
            return "https://generativelanguage.googleapis.com/v1beta";
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
