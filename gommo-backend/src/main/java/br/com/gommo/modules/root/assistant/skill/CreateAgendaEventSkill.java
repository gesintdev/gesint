package br.com.gommo.modules.root.assistant.skill;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import br.com.gommo.core.llm.LlmTool;
import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventRequestDto;
import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventResponseDto;
import br.com.gommo.modules.cfg.settings.agenda.service.IAgendaEventService;

@Component
public class CreateAgendaEventSkill implements AssistantSkill {

    private final IAgendaEventService agendaEventService;
    private final ObjectMapper objectMapper;

    public CreateAgendaEventSkill(IAgendaEventService agendaEventService, ObjectMapper objectMapper) {
        this.agendaEventService = agendaEventService;
        this.objectMapper = objectMapper;
    }

    @Override
    public String name() {
        return "create_agenda_event";
    }

    @Override
    public LlmTool toolDefinition() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("title", Map.of("type", "string", "description", "Título do evento"));
        properties.put(
                "startsAt",
                Map.of("type", "string", "description", "Início em ISO-8601 com timezone (ex.: 2026-10-14T09:00:00-03:00)"));
        properties.put(
                "endsAt",
                Map.of("type", "string", "description", "Fim em ISO-8601 com timezone"));
        properties.put("location", Map.of("type", "string", "description", "Local opcional"));
        properties.put("description", Map.of("type", "string", "description", "Descrição opcional"));
        return LlmTool.builder()
                .name(name())
                .description(
                        "Cria um evento na agenda do usuário autenticado. Nunca cria agenda de outras pessoas.")
                .parameters(Map.of(
                        "type", "object",
                        "properties", properties,
                        "required", List.of("title", "startsAt", "endsAt")))
                .build();
    }

    @Override
    public AssistantSkillResult execute(String argumentsJson) {
        try {
            JsonNode node = objectMapper.readTree(StringUtils.hasText(argumentsJson) ? argumentsJson : "{}");
            String title = node.path("title").asString(null);
            String startsAtRaw = node.path("startsAt").asString(null);
            String endsAtRaw = node.path("endsAt").asString(null);
            if (!StringUtils.hasText(title) || !StringUtils.hasText(startsAtRaw) || !StringUtils.hasText(endsAtRaw)) {
                return failure("Informe título, início e fim do evento.");
            }
            OffsetDateTime startsAt = OffsetDateTime.parse(startsAtRaw.trim());
            OffsetDateTime endsAt = OffsetDateTime.parse(endsAtRaw.trim());
            AgendaEventRequestDto request = AgendaEventRequestDto.builder()
                    .title(title.trim())
                    .startsAt(startsAt)
                    .endsAt(endsAt)
                    .location(nullable(node, "location"))
                    .description(nullable(node, "description"))
                    .build();
            AgendaEventResponseDto created = agendaEventService.create(request);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("created", true);
            payload.put("id", created.getId() != null ? created.getId().toString() : null);
            payload.put("title", created.getTitle());
            payload.put("startsAt", created.getStartsAt() != null ? created.getStartsAt().toString() : null);
            payload.put("endsAt", created.getEndsAt() != null ? created.getEndsAt().toString() : null);
            payload.put("message", "Evento criado na sua agenda.");
            return AssistantSkillResult.builder()
                    .success(true)
                    .contentForModel(objectMapper.writeValueAsString(payload))
                    .build();
        } catch (Exception ex) {
            return failure("Não foi possível criar o evento: " + safe(ex.getMessage()));
        }
    }

    private AssistantSkillResult failure(String message) {
        try {
            return AssistantSkillResult.builder()
                    .success(false)
                    .contentForModel(objectMapper.writeValueAsString(Map.of("created", false, "message", message)))
                    .build();
        } catch (RuntimeException ex) {
            return AssistantSkillResult.builder()
                    .success(false)
                    .contentForModel("{\"created\":false,\"message\":\"falha\"}")
                    .build();
        }
    }

    private static String nullable(JsonNode node, String field) {
        String value = node.path(field).asString(null);
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private static String safe(String detail) {
        if (!StringUtils.hasText(detail)) {
            return "erro desconhecido";
        }
        return detail.length() > 120 ? detail.substring(0, 120) + "…" : detail;
    }
}
