package br.com.gommo.modules.rh.person.recruiting.ai;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import br.com.gommo.core.llm.LlmClient;
import br.com.gommo.core.llm.LlmMessage;
import br.com.gommo.core.llm.LlmPurpose;
import br.com.gommo.core.llm.LlmRequest;
import br.com.gommo.core.llm.LlmResponse;

@Service
public class ResumeParseService {

    private static final String SYSTEM = """
            Extraia dados de currículo em JSON compacto (sem markdown).
            Schema:
            {"seniorityGuess":"JUNIOR|PLENO|SENIOR|null","skills":["..."],"experiences":[{"jobTitle":"...","company":"...","description":"..."}]}
            Máx. 6 experiences e 12 skills. Sem texto fora do JSON.
            """;

    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;

    public ResumeParseService(LlmClient llmClient, ObjectProvider<JsonMapper> jsonMapperProvider) {
        this.llmClient = llmClient;
        this.objectMapper = jsonMapperProvider.getIfAvailable(() -> JsonMapper.builder().build());
    }

    public ParsedResume parse(String resumeText, String vacancyJobTitle) {
        if (!StringUtils.hasText(resumeText)) {
            return ParsedResume.empty();
        }
        String prompt = """
                Cargo alvo: %s
                Texto do currículo (truncado):
                %s
                """.formatted(
                StringUtils.hasText(vacancyJobTitle) ? vacancyJobTitle.trim() : "não informado",
                resumeText.trim());
        try {
            LlmResponse response = llmClient.complete(LlmRequest.builder()
                    .purpose(LlmPurpose.RESUME_PARSE)
                    .systemInstruction(SYSTEM)
                    .messages(List.of(LlmMessage.builder().role("user").content(prompt).build()))
                    .temperature(0.1)
                    .maxOutputTokens(700)
                    .build());
            return fromJson(response.getContent());
        } catch (RuntimeException ex) {
            return ParsedResume.empty();
        }
    }

    private ParsedResume fromJson(String raw) {
        if (!StringUtils.hasText(raw)) {
            return ParsedResume.empty();
        }
        try {
            String json = unwrapJson(raw.trim());
            JsonNode root = objectMapper.readTree(json);
            if (root == null || root.isNull()) {
                return ParsedResume.empty();
            }
            String seniority = root.path("seniorityGuess").asString(null);
            List<String> skills = new ArrayList<>();
            JsonNode skillsNode = root.path("skills");
            if (skillsNode.isArray()) {
                for (JsonNode item : skillsNode) {
                    String skill = item.asString(null);
                    if (StringUtils.hasText(skill) && skills.size() < 12) {
                        skills.add(skill.trim());
                    }
                }
            }
            List<Map<String, String>> experiences = new ArrayList<>();
            JsonNode expNode = root.path("experiences");
            if (expNode.isArray()) {
                for (JsonNode item : expNode) {
                    if (experiences.size() >= 6) {
                        break;
                    }
                    Map<String, String> map = new LinkedHashMap<>();
                    map.put("jobTitle", item.path("jobTitle").asString(""));
                    map.put("company", item.path("company").asString(""));
                    map.put("description", item.path("description").asString(""));
                    experiences.add(map);
                }
            }
            return new ParsedResume(normalizeSeniority(seniority), skills, experiences);
        } catch (RuntimeException ex) {
            return ParsedResume.empty();
        }
    }

    private static String unwrapJson(String raw) {
        String text = raw;
        if (text.startsWith("```")) {
            int firstNl = text.indexOf('\n');
            int lastFence = text.lastIndexOf("```");
            if (firstNl > 0 && lastFence > firstNl) {
                text = text.substring(firstNl + 1, lastFence).trim();
            }
        }
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return text;
    }

    private static String normalizeSeniority(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "JUNIOR", "JÚNIOR", "JR" -> "JUNIOR";
            case "PLENO", "MID", "MID-LEVEL" -> "PLENO";
            case "SENIOR", "SÊNIOR", "SR" -> "SENIOR";
            default -> null;
        };
    }

    public record ParsedResume(String seniorityGuess, List<String> skills, List<Map<String, String>> experiences) {
        public static ParsedResume empty() {
            return new ParsedResume(null, List.of(), List.of());
        }
    }
}
