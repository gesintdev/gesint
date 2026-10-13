package br.com.gommo.modules.root.assistant.skill;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.llm.LlmTool;
import br.com.gommo.core.security.AuthorityWildcards;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.root.assistant.dto.AssistantDeepLinkDto;

@Component
public class SummarizeAdmissionSkill implements AssistantSkill {

    private final AdmissionProcessRepository admissionProcessRepository;
    private final ObjectMapper objectMapper;

    public SummarizeAdmissionSkill(
            AdmissionProcessRepository admissionProcessRepository, ObjectMapper objectMapper) {
        this.admissionProcessRepository = admissionProcessRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public String name() {
        return "summarize_admission";
    }

    @Override
    public LlmTool toolDefinition() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put(
                "nameQuery",
                Map.of("type", "string", "description", "Nome (ou parte) do colaborador/candidato em admissão"));
        return LlmTool.builder()
                .name(name())
                .description(
                        "Resume o status de admissão por nome, sem dados sensíveis (sem CPF/docs). "
                                + "Exige permissão admission:read.")
                .parameters(Map.of(
                        "type", "object",
                        "properties", properties,
                        "required", List.of("nameQuery")))
                .build();
    }

    @Override
    public AssistantSkillResult execute(String argumentsJson) {
        if (!hasAdmissionRead()) {
            return failure("Sem permissão para consultar admissões (admission:read).");
        }
        String nameQuery = readName(argumentsJson);
        if (!StringUtils.hasText(nameQuery) || nameQuery.length() < 2) {
            return failure("Informe ao menos 2 caracteres do nome.");
        }
        String pattern = "%" + nameQuery.trim().toLowerCase(Locale.ROOT) + "%";
        List<AdmissionProcess> found = admissionProcessRepository.searchForGlobal(
                StatusEnum.DELETED, AdmissionStatusEnum.CANCELLED, pattern, PageRequest.of(0, 5));
        List<Map<String, Object>> summaries = new ArrayList<>();
        List<AssistantDeepLinkDto> links = new ArrayList<>();
        for (AdmissionProcess admission : found) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("fullName", admission.getFullName());
            row.put(
                    "status",
                    admission.getAdmissionStatus() != null ? admission.getAdmissionStatus().name() : null);
            row.put(
                    "expectedStartDate",
                    admission.getExpectedStartDate() != null ? admission.getExpectedStartDate().toString() : null);
            row.put(
                    "startedAt",
                    admission.getStartedAt() != null ? admission.getStartedAt().toString() : null);
            row.put("manuallyApproved", admission.getManuallyApprovedAt() != null);
            summaries.add(row);
        }
        if (!summaries.isEmpty()) {
            links.add(AssistantDeepLinkDto.builder()
                    .label("Abrir Admissão")
                    .href("/collaborator/admission")
                    .build());
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("count", summaries.size());
        payload.put("admissions", summaries);
        if (summaries.isEmpty()) {
            payload.put("message", "Nenhuma admissão encontrada para esse nome.");
        } else {
            payload.put(
                    "message",
                    "Resumo não sensível. Oriente o usuário a abrir a tela de Admissão para detalhes.");
        }
        try {
            return AssistantSkillResult.builder()
                    .success(true)
                    .contentForModel(objectMapper.writeValueAsString(payload))
                    .links(links)
                    .build();
        } catch (RuntimeException ex) {
            return failure("Falha ao montar resumo.");
        }
    }

    private boolean hasAdmissionRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return AuthorityWildcards.allows(authentication.getAuthorities(), "admission:read");
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

    private AssistantSkillResult failure(String message) {
        try {
            return AssistantSkillResult.builder()
                    .success(false)
                    .contentForModel(objectMapper.writeValueAsString(Map.of("count", 0, "message", message)))
                    .build();
        } catch (RuntimeException ex) {
            return AssistantSkillResult.builder()
                    .success(false)
                    .contentForModel("{\"count\":0,\"message\":\"falha\"}")
                    .build();
        }
    }
}
