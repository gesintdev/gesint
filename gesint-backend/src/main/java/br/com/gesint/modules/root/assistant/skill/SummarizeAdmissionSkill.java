package br.com.gesint.modules.root.assistant.skill;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.llm.LlmTool;
import br.com.gesint.core.security.AuthorityWildcards;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gesint.modules.root.search.service.provider.AdmissionGlobalSearchProvider;

@Component
public class SummarizeAdmissionSkill implements AssistantSkill {

    private static final DateTimeFormatter DATE_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String ADMISSION_HREF = AdmissionGlobalSearchProvider.HREF;

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
                                + "Exige permissão admission:read. Os campos já vêm em linguagem de negócio "
                                + "(status e aprovação em português); use esses textos na resposta ao usuário.")
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
        boolean multiple = found.size() > 1;
        for (AdmissionProcess admission : found) {
            String displayName = displayName(admission);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("fullName", displayName);
            row.put("status", AdmissionGlobalSearchProvider.statusLabel(admission.getAdmissionStatus()));
            row.put("expectedStartDate", formatDateBr(admission.getExpectedStartDate()));
            row.put("startedAt", formatDateBr(admission.getStartedAt()));
            row.put(
                    "manualApproval",
                    admission.getManuallyApprovedAt() != null ? "Realizada" : "Pendente");
            summaries.add(row);
            if (admission.getId() != null) {
                String label = multiple ? "Abrir Admissão - " + displayName : "Abrir Admissão";
                links.add(AssistantDeepLinkDto.builder()
                        .label(label)
                        .href(ADMISSION_HREF + "?edit=" + admission.getId())
                        .build());
            }
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("count", summaries.size());
        payload.put("admissions", summaries);
        if (summaries.isEmpty()) {
            payload.put("message", "Nenhuma admissão encontrada para esse nome.");
        } else {
            payload.put(
                    "message",
                    "Resumo não sensível com textos prontos para o usuário. "
                            + "Repita status e aprovação exatamente como retornados (já em português). "
                            + "Não cite códigos internos nem nomes de campos técnicos. "
                            + "O deep link da admissão específica já está anexado.");
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

    private static String displayName(AdmissionProcess admission) {
        if (StringUtils.hasText(admission.getSocialName())) {
            return admission.getSocialName().trim();
        }
        return admission.getFullName();
    }

    private static String formatDateBr(LocalDate date) {
        return date != null ? DATE_BR.format(date) : null;
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
