package br.com.gesint.modules.root.assistant.skill;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import br.com.gesint.core.llm.LlmTool;
import br.com.gesint.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gesint.modules.root.assistant.knowledge.AssistantCatalogItem;
import br.com.gesint.modules.root.assistant.knowledge.AssistantKnowledgeCatalogLoader;

@Component
public class GuideFlowSkill implements AssistantSkill {

    private final AssistantKnowledgeCatalogLoader catalogLoader;
    private final ObjectMapper objectMapper;

    public GuideFlowSkill(AssistantKnowledgeCatalogLoader catalogLoader, ObjectMapper objectMapper) {
        this.catalogLoader = catalogLoader;
        this.objectMapper = objectMapper;
    }

    @Override
    public String name() {
        return "guide_flow";
    }

    @Override
    public LlmTool toolDefinition() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put(
                "query",
                Map.of(
                        "type",
                        "string",
                        "description",
                        "Descrição do que o usuário quer fazer (ex.: desligamento, férias, vagas)"));
        return LlmTool.builder()
                .name(name())
                .description(
                        "Busca no mapa do Gesint o fluxo correspondente e devolve passos + link da tela. "
                                + "Use para orientar navegação; não executa ações complexas.")
                .parameters(Map.of(
                        "type", "object",
                        "properties", properties,
                        "required", List.of("query")))
                .build();
    }

    @Override
    public AssistantSkillResult execute(String argumentsJson) {
        String query = readQuery(argumentsJson);
        List<AssistantCatalogItem> matches = catalogLoader.search(query, 3);
        List<AssistantDeepLinkDto> links = new ArrayList<>();
        List<Map<String, Object>> payload = new ArrayList<>();
        for (AssistantCatalogItem item : matches) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("system", item.getSystem());
            row.put("menu", item.getMenu());
            row.put("topic", item.getTopic());
            row.put("action", item.getAction());
            row.put("steps", item.getSteps());
            if (item.getGuidance() != null && !item.getGuidance().isEmpty()) {
                row.put("guidance", item.getGuidance());
            }
            if (StringUtils.hasText(item.getHref())) {
                row.put("href", item.getHref());
                links.add(AssistantDeepLinkDto.builder()
                        .label(item.getSystem() + " → " + item.getMenu() + " → " + item.getTopic())
                        .href(item.getHref())
                        .build());
            }
            payload.add(row);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("matches", payload);
        result.put(
                "message",
                payload.isEmpty()
                        ? "Nenhum fluxo encontrado com as permissões do usuário. Sugira a busca global do header."
                        : "Use system/menu/topic/steps/guidance em linguagem de negócio. "
                                + "Não cite ids técnicos, códigos internos nem nomes de campos de sistema.");
        return AssistantSkillResult.builder()
                .success(true)
                .contentForModel(writeJson(result))
                .links(links)
                .build();
    }

    private String readQuery(String argumentsJson) {
        try {
            JsonNode node = objectMapper.readTree(StringUtils.hasText(argumentsJson) ? argumentsJson : "{}");
            String query = node.path("query").asString(null);
            return StringUtils.hasText(query) ? query.trim() : "";
        } catch (RuntimeException ex) {
            return "";
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (RuntimeException ex) {
            return "{\"error\":\"serialize_failed\"}";
        }
    }
}
