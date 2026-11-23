package br.com.gesint.modules.root.assistant.skill;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import br.com.gesint.core.llm.LlmTool;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorPickerDiagnosis;
import br.com.gesint.modules.rh.person.collaborators.people.service.ICollaboratorService;
import br.com.gesint.modules.root.assistant.activity.AssistantActivity;
import br.com.gesint.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gesint.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gesint.modules.root.assistant.knowledge.AttendanceListingQuestion;

@Component
public class DiagnoseAttendanceListingSkill implements AssistantSkill {

    private static final Logger log = LoggerFactory.getLogger(DiagnoseAttendanceListingSkill.class);

    private final ICollaboratorService collaboratorService;
    private final ObjectMapper objectMapper;

    public DiagnoseAttendanceListingSkill(ICollaboratorService collaboratorService, ObjectMapper objectMapper) {
        this.collaboratorService = collaboratorService;
        this.objectMapper = objectMapper;
    }

    @Override
    public String name() {
        return "diagnose_attendance_listing";
    }

    @Override
    public LlmTool toolDefinition() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put(
                "nameQuery",
                Map.of("type", "string", "description", "Nome do colaborador que não aparece para lançar ponto"));
        return LlmTool.builder()
                .name(name())
                .description(
                        "Somente a consulta de colaborador do Ponto. Explica por que a pessoa entra ou não "
                                + "na lista para lançar ponto, com a mesma regra da tela: admissão concluída e "
                                + "sem desligamento. Não use para férias. O texto devolvido já está pronto: repita esse texto.")
                .parameters(Map.of(
                        "type", "object",
                        "properties", properties,
                        "required", List.of("nameQuery")))
                .build();
    }

    public AssistantChatResponseDto tryDirect(String message, String menuLabel) {
        if (!AttendanceListingQuestion.matches(message, menuLabel)) {
            return null;
        }
        String name = AttendanceListingQuestion.nameIn(message);
        AssistantActivity.report("Consultando ponto...");
        if (!StringUtils.hasText(name)) {
            return AssistantChatResponseDto.builder()
                    .reply("Qual é o nome do colaborador que não aparece para lançar ponto?")
                    .links(List.of())
                    .build();
        }
        AssistantActivity.report("Consultando o cadastro de " + name + "...");
        return toResponse(diagnose(name));
    }

    @Override
    public AssistantSkillResult execute(String argumentsJson) {
        String name = readName(argumentsJson);
        AssistantActivity.report(
                StringUtils.hasText(name) ? "Consultando o cadastro de " + name + "..." : "Consultando ponto...");
        if (!StringUtils.hasText(name) || name.length() < 2) {
            return ready("Me diga o nome do colaborador que não aparece para lançar ponto.", null, null);
        }
        return diagnose(name);
    }

    private AssistantSkillResult diagnose(String name) {
        try {
            CollaboratorPickerDiagnosis diagnosis = collaboratorService.explainAttendancePicker(name);
            if (diagnosis == null || !StringUtils.hasText(diagnosis.text())) {
                return ready("Não consegui consultar o ponto agora.", null, null);
            }
            return ready(diagnosis.text(), diagnosis.linkLabel(), diagnosis.href());
        } catch (AccessDeniedException ex) {
            return ready("Você não tem permissão para consultar o ponto.", null, null);
        } catch (RuntimeException ex) {
            log.warn("Attendance listing diagnosis failed: {}", ex.getMessage());
            return ready("Não consegui consultar o ponto agora.", null, null);
        }
    }

    private AssistantSkillResult ready(String text, String linkLabel, String href) {
        AssistantSkillResult.AssistantSkillResultBuilder builder = AssistantSkillResult.builder()
                .success(true)
                .directReply(true)
                .contentForModel(text);
        if (StringUtils.hasText(href) && StringUtils.hasText(linkLabel)) {
            builder.links(List.of(AssistantDeepLinkDto.builder().label(linkLabel).href(href).build()));
        }
        return builder.build();
    }

    private AssistantChatResponseDto toResponse(AssistantSkillResult result) {
        List<AssistantDeepLinkDto> links = result.getLinks() == null ? List.of() : result.getLinks();
        String reply = StringUtils.hasText(result.getContentForModel())
                ? result.getContentForModel().trim()
                : "Não consegui consultar o ponto agora.";
        return AssistantChatResponseDto.builder().reply(reply).links(links).build();
    }

    private String readName(String argumentsJson) {
        try {
            JsonNode node = objectMapper.readTree(StringUtils.hasText(argumentsJson) ? argumentsJson : "{}");
            String value = node.path("nameQuery").asString(null);
            return StringUtils.hasText(value) ? value.trim() : "";
        } catch (RuntimeException ex) {
            return "";
        }
    }
}
