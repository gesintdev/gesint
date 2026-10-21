package br.com.gesint.core.llm;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

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

import br.com.gesint.core.exception.BusinessException;

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
                        String errorBody = "";
                        try {
                            byte[] bytes = res.getBody().readAllBytes();
                            if (bytes.length > 0) {
                                errorBody = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                            }
                        } catch (Exception ignored) {
                            // ignore body read failures
                        }
                        log.warn("Gemini API error HTTP {}: {}", status, safeDetail(errorBody));
                        if (status == 429) {
                            throw LlmException.quotaExceeded();
                        }
                        if (status == 404) {
                            throw LlmException.modelNotFound(model);
                        }
                        String detail = StringUtils.hasText(errorBody)
                                ? "HTTP " + status + ": " + safeDetail(errorBody)
                                : "HTTP " + status;
                        throw LlmException.callFailed(detail);
                    })
                    .body(String.class);
            JsonNode response = parseJson(raw);
            String text = extractText(response);
            List<LlmToolCall> toolCalls = extractToolCalls(response);
            if (!StringUtils.hasText(text) && toolCalls.isEmpty()) {
                throw LlmException.emptyResponse();
            }
            LlmTokenUsage usage = extractUsage(response);
            usageTracker.record(usage);
            return LlmResponse.builder()
                    .content(StringUtils.hasText(text) ? text.trim() : "")
                    .provider("gemini")
                    .model(model)
                    .usage(usage)
                    .toolCalls(toolCalls)
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

        List<Map<String, Object>> contents = buildContents(request.getMessages());
        if (contents.isEmpty()) {
            throw LlmException.callFailed("Nenhuma mensagem válida para enviar ao modelo");
        }
        body.put("contents", contents);

        List<Map<String, Object>> declarations = buildFunctionDeclarations(request.getTools());
        if (!declarations.isEmpty()) {
            body.put("tools", List.of(Map.of("functionDeclarations", declarations)));
        }

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

    /**
     * Agrupa functionResponses consecutivas num único content {@code user} (exigência do Gemini
     * para function calls paralelas) e preserva {@code thoughtSignature} nos functionCalls.
     */
    private List<Map<String, Object>> buildContents(List<LlmMessage> messages) {
        List<Map<String, Object>> contents = new ArrayList<>();
        if (messages == null) {
            return contents;
        }
        List<Map<String, Object>> pendingFunctionResponses = new ArrayList<>();
        for (LlmMessage message : messages) {
            if (message == null) {
                continue;
            }
            String role = normalizeGeminiRole(message.getRole());
            if ("tool".equals(role) || "function".equalsIgnoreCase(message.getRole())) {
                pendingFunctionResponses.add(buildFunctionResponsePart(message));
                continue;
            }
            flushFunctionResponses(contents, pendingFunctionResponses);
            Map<String, Object> content = buildContent(message);
            if (content != null) {
                contents.add(content);
            }
        }
        flushFunctionResponses(contents, pendingFunctionResponses);
        return contents;
    }

    private void flushFunctionResponses(
            List<Map<String, Object>> contents, List<Map<String, Object>> pendingFunctionResponses) {
        if (pendingFunctionResponses.isEmpty()) {
            return;
        }
        contents.add(Map.of("role", "user", "parts", List.copyOf(pendingFunctionResponses)));
        pendingFunctionResponses.clear();
    }

    private Map<String, Object> buildFunctionResponsePart(LlmMessage message) {
        Map<String, Object> response = new LinkedHashMap<>();
        String name = StringUtils.hasText(message.getName())
                ? message.getName().trim()
                : (StringUtils.hasText(message.getToolCallId()) ? message.getToolCallId() : "tool");
        response.put("name", name);
        Object responseBody = parseArgumentsObject(message.getContent());
        if (responseBody instanceof Map<?, ?> map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> asMap = (Map<String, Object>) map;
            response.put("response", asMap);
        } else {
            response.put("response", Map.of("result", responseBody));
        }
        return Map.of("functionResponse", response);
    }

    private Map<String, Object> buildContent(LlmMessage message) {
        String role = normalizeGeminiRole(message.getRole());
        if ("system".equals(role) || "tool".equals(role)) {
            return null;
        }
        List<Map<String, Object>> parts = new ArrayList<>();
        if (message.getToolCalls() != null && !message.getToolCalls().isEmpty()) {
            if (StringUtils.hasText(message.getContent())) {
                parts.add(Map.of("text", message.getContent().trim()));
            }
            for (LlmToolCall call : message.getToolCalls()) {
                if (call == null || !StringUtils.hasText(call.getName())) {
                    continue;
                }
                Map<String, Object> fn = new LinkedHashMap<>();
                fn.put("name", call.getName());
                fn.put("args", parseArgumentsObject(call.getArgumentsJson()));
                Map<String, Object> part = new LinkedHashMap<>();
                part.put("functionCall", fn);
                // Gemini 3+ exige ecoar thoughtSignature no mesmo part do functionCall.
                if (StringUtils.hasText(call.getThoughtSignature())) {
                    part.put("thoughtSignature", call.getThoughtSignature());
                }
                parts.add(part);
            }
            if (parts.isEmpty()) {
                return null;
            }
            return Map.of("role", "model", "parts", parts);
        }
        if (!StringUtils.hasText(message.getContent())) {
            return null;
        }
        return Map.of(
                "role",
                role,
                "parts",
                List.of(Map.of("text", message.getContent().trim())));
    }

    private List<Map<String, Object>> buildFunctionDeclarations(List<LlmTool> tools) {
        if (tools == null || tools.isEmpty()) {
            return List.of();
        }
        List<Map<String, Object>> declarations = new ArrayList<>();
        for (LlmTool tool : tools) {
            if (tool == null || !StringUtils.hasText(tool.getName())) {
                continue;
            }
            Map<String, Object> declaration = new LinkedHashMap<>();
            declaration.put("name", tool.getName().trim());
            if (StringUtils.hasText(tool.getDescription())) {
                declaration.put("description", tool.getDescription().trim());
            }
            Map<String, Object> parameters = tool.getParameters() != null && !tool.getParameters().isEmpty()
                    ? tool.getParameters()
                    : Map.of("type", "object", "properties", Map.of());
            declaration.put("parameters", parameters);
            declarations.add(declaration);
        }
        return declarations;
    }

    private Object parseArgumentsObject(String argumentsJson) {
        if (!StringUtils.hasText(argumentsJson)) {
            return Map.of();
        }
        try {
            JsonNode node = objectMapper.readTree(argumentsJson);
            if (node == null || node.isNull()) {
                return Map.of();
            }
            if (node.isObject() || node.isArray()) {
                return objectMapper.convertValue(node, Object.class);
            }
            return Map.of("value", node.asString());
        } catch (RuntimeException ex) {
            return Map.of("raw", argumentsJson);
        }
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
        if ("tool".equals(normalized) || "function".equals(normalized)) {
            return "tool";
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

    private List<LlmToolCall> extractToolCalls(JsonNode response) {
        if (response == null) {
            return List.of();
        }
        JsonNode candidates = response.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            return List.of();
        }
        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (!parts.isArray()) {
            return List.of();
        }
        List<LlmToolCall> result = new ArrayList<>();
        for (JsonNode part : parts) {
            JsonNode functionCall = part.path("functionCall");
            if (functionCall.isMissingNode() || functionCall.isNull()) {
                continue;
            }
            String name = functionCall.path("name").asString(null);
            if (!StringUtils.hasText(name)) {
                continue;
            }
            JsonNode args = functionCall.path("args");
            String argumentsJson = "{}";
            if (!args.isMissingNode() && !args.isNull()) {
                try {
                    argumentsJson = objectMapper.writeValueAsString(args);
                } catch (RuntimeException ignored) {
                    argumentsJson = "{}";
                }
            }
            String thoughtSignature = part.path("thoughtSignature").asString(null);
            if (!StringUtils.hasText(thoughtSignature)) {
                // Algumas respostas usam snake_case.
                thoughtSignature = part.path("thought_signature").asString(null);
            }
            result.add(LlmToolCall.builder()
                    .id(name + "-" + UUID.randomUUID().toString().substring(0, 8))
                    .name(name)
                    .argumentsJson(argumentsJson)
                    .thoughtSignature(StringUtils.hasText(thoughtSignature) ? thoughtSignature : null)
                    .build());
        }
        return List.copyOf(result);
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
