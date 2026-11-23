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
import br.com.gesint.modules.rh.person.leave.dto.VacationListingDiagnosis;
import br.com.gesint.modules.rh.person.leave.service.ILeaveRequestService;
import br.com.gesint.modules.root.assistant.activity.AssistantActivity;
import br.com.gesint.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gesint.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gesint.modules.root.assistant.knowledge.VacationListingQuestion;

@Component
public class DiagnoseVacationListingSkill implements AssistantSkill {

    private static final Logger log = LoggerFactory.getLogger(DiagnoseVacationListingSkill.class);

    private final ILeaveRequestService leaveRequestService;
    private final ObjectMapper objectMapper;

    public DiagnoseVacationListingSkill(ILeaveRequestService leaveRequestService, ObjectMapper objectMapper) {
        this.leaveRequestService = leaveRequestService;
        this.objectMapper = objectMapper;
    }

    @Override
    public String name() {
        return "diagnose_vacation_listing";
    }

    @Override
    public LlmTool toolDefinition() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put(
                "nameQuery",
                Map.of(
                        "type",
                        "string",
                        "description",
                        "Nome do colaborador que não aparece, ou que o usuário quer conferir, na listagem de férias"));
        return LlmTool.builder()
                .name(name())
                .description(
                        "Somente a listagem de férias. Consulta o cadastro, o contrato e as férias e explica "
                                + "por que a pessoa entra ou não nessa lista. Não use para ponto, admissão ou outra tela. "
                                + "O texto devolvido já está pronto: repita esse texto.")
                .parameters(Map.of(
                        "type", "object",
                        "properties", properties,
                        "required", List.of("nameQuery")))
                .build();
    }

    /**
     * Resposta direta quando a pergunta já é sobre a listagem de férias.
     * Nulo se a mensagem for de outro assunto.
     */
    public AssistantChatResponseDto tryDirect(String message, String menuLabel) {
        if (!VacationListingQuestion.matches(message, menuLabel)) {
            return null;
        }
        String name = VacationListingQuestion.nameIn(message);
        AssistantActivity.report("Consultando férias...");
        if (!StringUtils.hasText(name)) {
            return AssistantChatResponseDto.builder()
                    .reply("Qual é o nome do colaborador que não aparece na listagem de férias?")
                    .links(List.of())
                    .build();
        }
        AssistantActivity.report("Consultando o cadastro de " + name + "...");
        AssistantSkillResult result = diagnose(name);
        return toResponse(result);
    }

    @Override
    public AssistantSkillResult execute(String argumentsJson) {
        String name = readName(argumentsJson);
        AssistantActivity.report(
                StringUtils.hasText(name) ? "Consultando o cadastro de " + name + "..." : "Consultando férias...");
        if (!StringUtils.hasText(name) || name.length() < 2) {
            return ready("Me diga o nome do colaborador que não aparece na listagem de férias.", null, null);
        }
        return diagnose(name);
    }

    private AssistantSkillResult diagnose(String name) {
        try {
            VacationListingDiagnosis diagnosis = leaveRequestService.explainVacationListing(name);
            if (diagnosis == null || !StringUtils.hasText(diagnosis.text())) {
                return ready("Não consegui consultar a listagem de férias agora.", null, null);
            }
            return ready(diagnosis.text(), diagnosis.linkLabel(), diagnosis.href());
        } catch (AccessDeniedException ex) {
            return ready("Você não tem permissão para consultar a listagem de férias.", null, null);
        } catch (RuntimeException ex) {
            log.warn("Vacation listing diagnosis failed: {}", ex.getMessage());
            return ready("Não consegui consultar a listagem de férias agora.", null, null);
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
                : "Não consegui consultar a listagem de férias agora.";
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
