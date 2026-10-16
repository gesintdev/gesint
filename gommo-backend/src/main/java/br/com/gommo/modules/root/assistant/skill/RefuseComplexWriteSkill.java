package br.com.gommo.modules.root.assistant.skill;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import br.com.gommo.core.llm.LlmTool;
import br.com.gommo.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gommo.modules.root.assistant.knowledge.AssistantCatalogItem;
import br.com.gommo.modules.root.assistant.knowledge.AssistantKnowledgeCatalogLoader;

@Component
public class RefuseComplexWriteSkill implements AssistantSkill {

    private final AssistantKnowledgeCatalogLoader catalogLoader;
    private final ObjectMapper objectMapper;

    public RefuseComplexWriteSkill(AssistantKnowledgeCatalogLoader catalogLoader, ObjectMapper objectMapper) {
        this.catalogLoader = catalogLoader;
        this.objectMapper = objectMapper;
    }

    @Override
    public String name() {
        return "refuse_complex_write";
    }

    @Override
    public LlmTool toolDefinition() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put(
                "topic",
                Map.of(
                        "type",
                        "string",
                        "description",
                        "Ação complexa pedida (ex.: criar admissão, concluir desligamento, alterar salário)"));
        return LlmTool.builder()
                .name(name())
                .description(
                        "Recusa execução de escritas complexas e devolve orientação + link da tela correta. "
                                + "Sempre use quando o usuário pedir criar/alterar processos sensíveis.")
                .parameters(Map.of(
                        "type", "object",
                        "properties", properties,
                        "required", List.of("topic")))
                .build();
    }

    @Override
    public AssistantSkillResult execute(String argumentsJson) {
        String topic = readTopic(argumentsJson);
        List<AssistantCatalogItem> matches = catalogLoader.search(topic, 1);
        List<AssistantDeepLinkDto> links = new ArrayList<>();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("refused", true);
        result.put(
                "message",
                "Essa ação precisa ser feita na tela do Gesint. O assistente não cria nem altera "
                        + "admissões, desligamentos, salários ou permissões.");
        if (!matches.isEmpty()) {
            AssistantCatalogItem item = matches.getFirst();
            result.put("system", item.getSystem());
            result.put("menu", item.getMenu());
            result.put("topic", item.getTopic());
            result.put("steps", item.getSteps());
            if (item.getGuidance() != null && !item.getGuidance().isEmpty()) {
                result.put("guidance", item.getGuidance());
            }
            if (StringUtils.hasText(item.getHref())) {
                result.put("href", item.getHref());
                links.add(AssistantDeepLinkDto.builder()
                        .label("Abrir " + item.getTopic())
                        .href(item.getHref())
                        .build());
            }
        }
        return AssistantSkillResult.builder()
                .success(true)
                .contentForModel(writeJson(result))
                .links(links)
                .build();
    }

    private String readTopic(String argumentsJson) {
        try {
            JsonNode node = objectMapper.readTree(StringUtils.hasText(argumentsJson) ? argumentsJson : "{}");
            String topic = node.path("topic").asString(null);
            return StringUtils.hasText(topic) ? topic.trim() : "";
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
