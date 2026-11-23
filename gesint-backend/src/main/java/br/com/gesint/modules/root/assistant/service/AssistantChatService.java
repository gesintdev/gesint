package br.com.gesint.modules.root.assistant.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import br.com.gesint.core.exception.BusinessException;
import br.com.gesint.core.llm.LlmClient;
import br.com.gesint.core.llm.LlmMessage;
import br.com.gesint.core.llm.LlmPurpose;
import br.com.gesint.core.llm.LlmRequest;
import br.com.gesint.core.llm.LlmResponse;
import br.com.gesint.core.llm.LlmTokenUsage;
import br.com.gesint.core.llm.LlmTool;
import br.com.gesint.core.llm.LlmToolCall;
import br.com.gesint.core.llm.LlmUsageSnapshot;
import br.com.gesint.core.llm.LlmUsageTracker;
import br.com.gesint.core.tenant.MultiTenantProperties;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.core.tenant.TenantContractedSystemsLookup;
import br.com.gesint.modules.root.assistant.activity.AssistantActivity;
import br.com.gesint.modules.root.assistant.dto.AssistantChatMessageDto;
import br.com.gesint.modules.root.assistant.dto.AssistantChatRequestDto;
import br.com.gesint.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gesint.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gesint.modules.root.assistant.dto.AssistantLlmUsageDto;
import br.com.gesint.modules.root.assistant.dto.AssistantMenuFocusDto;
import br.com.gesint.modules.root.assistant.exception.AssistantException;
import br.com.gesint.modules.root.assistant.guard.AssistantJailbreakDetector;
import br.com.gesint.modules.root.assistant.knowledge.AssistantCatalogComplexity;
import br.com.gesint.modules.root.assistant.knowledge.AssistantCatalogItem;
import br.com.gesint.modules.root.assistant.knowledge.AssistantContextSelector;
import br.com.gesint.modules.root.assistant.knowledge.AssistantKnowledgeCatalogLoader;
import br.com.gesint.modules.root.assistant.knowledge.AssistantKnowledgeLoader;
import br.com.gesint.modules.root.assistant.log.AssistantErrorLogWriter;
import br.com.gesint.modules.root.assistant.skill.AssistantSkill;
import br.com.gesint.modules.root.assistant.skill.AssistantSkillRegistry;
import br.com.gesint.modules.root.assistant.skill.AssistantSkillResult;
import br.com.gesint.modules.root.assistant.knowledge.AttendanceListingQuestion;
import br.com.gesint.modules.root.assistant.knowledge.VacationListingQuestion;
import br.com.gesint.modules.root.assistant.skill.DiagnoseAttendanceListingSkill;
import br.com.gesint.modules.root.assistant.skill.DiagnoseVacationListingSkill;

@Service
public class AssistantChatService implements IAssistantChatService {

    private static final Logger log = LoggerFactory.getLogger(AssistantChatService.class);
    private static final int MAX_HISTORY_MESSAGES = 12;
    private static final int MAX_TOOL_ROUNDS = 3;

    private final LlmClient llmClient;
    private final AssistantKnowledgeLoader knowledgeLoader;
    private final AssistantKnowledgeCatalogLoader catalogLoader;
    private final AssistantContextSelector contextSelector;
    private final LlmUsageTracker usageTracker;
    private final AssistantSkillRegistry skillRegistry;
    private final AssistantJailbreakDetector jailbreakDetector;
    private final AssistantErrorLogWriter errorLogWriter;
    private final TenantContractedSystemsLookup contractedSystemsLookup;
    private final MultiTenantProperties multiTenantProperties;
    private final AdmissionDeadlineAssistant admissionDeadlineAssistant;
    private final DiagnoseVacationListingSkill diagnoseVacationListingSkill;
    private final DiagnoseAttendanceListingSkill diagnoseAttendanceListingSkill;

    public AssistantChatService(
            LlmClient llmClient,
            AssistantKnowledgeLoader knowledgeLoader,
            AssistantKnowledgeCatalogLoader catalogLoader,
            AssistantContextSelector contextSelector,
            LlmUsageTracker usageTracker,
            AssistantSkillRegistry skillRegistry,
            AssistantJailbreakDetector jailbreakDetector,
            AssistantErrorLogWriter errorLogWriter,
            TenantContractedSystemsLookup contractedSystemsLookup,
            MultiTenantProperties multiTenantProperties,
            AdmissionDeadlineAssistant admissionDeadlineAssistant,
            DiagnoseVacationListingSkill diagnoseVacationListingSkill,
            DiagnoseAttendanceListingSkill diagnoseAttendanceListingSkill) {
        this.llmClient = llmClient;
        this.knowledgeLoader = knowledgeLoader;
        this.catalogLoader = catalogLoader;
        this.contextSelector = contextSelector;
        this.usageTracker = usageTracker;
        this.skillRegistry = skillRegistry;
        this.jailbreakDetector = jailbreakDetector;
        this.errorLogWriter = errorLogWriter;
        this.contractedSystemsLookup = contractedSystemsLookup;
        this.multiTenantProperties = multiTenantProperties;
        this.admissionDeadlineAssistant = admissionDeadlineAssistant;
        this.diagnoseVacationListingSkill = diagnoseVacationListingSkill;
        this.diagnoseAttendanceListingSkill = diagnoseAttendanceListingSkill;
    }

    @Override
    public AssistantChatResponseDto chat(AssistantChatRequestDto request) {
        ensureAssistantEnabled();
        List<LlmMessage> messages = toLlmMessages(request.getMessages());
        if (messages.isEmpty()) {
            throw AssistantException.invalidMessage();
        }
        while (!messages.isEmpty() && !"user".equals(messages.getFirst().getRole())) {
            messages.removeFirst();
        }
        boolean hasUser = messages.stream().anyMatch(message -> "user".equals(message.getRole()));
        if (!hasUser) {
            throw AssistantException.invalidMessage();
        }

        String latestUser = latestUserContent(messages);
        if (jailbreakDetector.isJailbreakAttempt(latestUser)) {
            return AssistantChatResponseDto.builder()
                    .reply(
                            "Não posso ajudar com pedidos para ignorar regras, fingir permissões ou contornar o sistema. "
                                    + "Use o Gesint com o perfil que você tem.")
                    .links(List.of())
                    .build();
        }

        // Prazo da esteira com CPF: explica o caso sem mandar o documento ao modelo e sem repeti-lo.
        if (contextSelector.hasCpfNumber(latestUser) && contextSelector.isAdmissionDeadlineQuestion(latestUser)) {
            return admissionDeadlineReply(latestUser);
        }

        // Consulta por CPF: não devolve dado sensível no chat; orienta a tela certa.
        if (contextSelector.looksLikeCpfLookup(latestUser)) {
            return sensitiveLookupReply();
        }

        // Caso de uma pessoa (pelo nome) segue para a skill. Regra geral da tela fica no catálogo.
        boolean specificAdmissionCase = contextSelector.isAdmissionDeadlineQuestion(latestUser)
                && contextSelector.mentionsAdmissionPerson(latestUser);

        // "Por que fulano não aparece?" consulta a regra da tela em que a conversa está.
        String menuLabel = request.getMenuFocus() != null ? request.getMenuFocus().getLabel() : null;
        AssistantChatResponseDto attendanceListing =
                diagnoseAttendanceListingSkill.tryDirect(latestUser, menuLabel);
        if (attendanceListing != null) {
            return attendanceListing;
        }
        AssistantChatResponseDto vacationListing = diagnoseVacationListingSkill.tryDirect(latestUser, menuLabel);
        if (vacationListing != null) {
            return vacationListing;
        }

        // Só a abertura do menu é texto do catálogo. A pergunta seguinte vai para a I.A.
        boolean focusedFollowUp = isFocusedFollowUp(request.getMenuFocus());
        if (!specificAdmissionCase && !focusedFollowUp) {
            AssistantChatResponseDto focused = replyForFocusedMenu(request.getMenuFocus());
            if (focused != null) {
                return focused;
            }
        }

        // Orientação de tela pelo catálogo (determinística): navegação ou "por que a tela é assim".
        // Na conversa do menu isso não vale: a pergunta já é sobre a tela escolhida.
        if (!specificAdmissionCase && !focusedFollowUp && contextSelector.needsRouteGuide(latestUser)) {
            AssistantChatResponseDto catalogGuide = guideFromCatalog(latestUser, true, false);
            if (catalogGuide != null) {
                return catalogGuide;
            }
        }
        if (!specificAdmissionCase && !focusedFollowUp && contextSelector.needsModuleGuidance(latestUser)) {
            AssistantChatResponseDto catalogGuide = guideFromCatalog(latestUser, true, true);
            if (catalogGuide != null) {
                return catalogGuide;
            }
        }

        List<LlmMessage> history = trimHistory(messages, MAX_HISTORY_MESSAGES);
        List<AssistantDeepLinkDto> collectedLinks = new ArrayList<>();
        Map<String, AssistantDeepLinkDto> linkByHref = new LinkedHashMap<>();
        List<String> skillSummaries = new ArrayList<>();

        try {
            LlmResponse response = null;
            for (int round = 0; round <= MAX_TOOL_ROUNDS; round++) {
                AssistantActivity.report(round == 0 ? "Pensando..." : "Escrevendo a resposta...");
                try {
                    response = llmClient.complete(LlmRequest.builder()
                            .purpose(LlmPurpose.SUPPORT_CHAT)
                            .systemInstruction(systemInstruction(request.getMenuFocus(), focusedFollowUp))
                            .messages(history)
                            .tools(toolsFor(latestUser, menuLabel, focusedFollowUp))
                            .build());
                } catch (RuntimeException ex) {
                    if (!linkByHref.isEmpty() || !skillSummaries.isEmpty()) {
                        log.warn("Assistant follow-up LLM failed after skills; using skill fallback: {}", ex.getMessage());
                        collectedLinks.addAll(linkByHref.values());
                        return AssistantChatResponseDto.builder()
                                .reply(fallbackReplyFromSkills(skillSummaries, linkByHref.values()))
                                .links(collectedLinks)
                                .build();
                    }
                    if (!focusedFollowUp) {
                        AssistantChatResponseDto catalogFallback = guideFromCatalog(latestUser, false, false);
                        if (catalogFallback != null) {
                            log.warn("Assistant LLM failed; using catalog guide fallback: {}", ex.getMessage());
                            return catalogFallback;
                        }
                    }
                    throw ex;
                }

                if (!response.hasToolCalls()) {
                    break;
                }
                if (round == MAX_TOOL_ROUNDS) {
                    break;
                }

                history.add(LlmMessage.builder()
                        .role("assistant")
                        .content(StringUtils.hasText(response.getContent()) ? response.getContent() : null)
                        .toolCalls(response.getToolCalls())
                        .build());

                for (LlmToolCall call : response.getToolCalls()) {
                    AssistantSkillResult skillResult = executeSkill(call);
                    if (skillResult.getLinks() != null) {
                        for (AssistantDeepLinkDto link : skillResult.getLinks()) {
                            if (link != null && StringUtils.hasText(link.getHref())) {
                                linkByHref.putIfAbsent(link.getHref(), link);
                            }
                        }
                    }
                    if (StringUtils.hasText(skillResult.getContentForModel())) {
                        skillSummaries.add(skillResult.getContentForModel());
                    }
                    if (skillResult.isDirectReply()) {
                        collectedLinks.addAll(linkByHref.values());
                        String direct = skillResult.getContentForModel();
                        return AssistantChatResponseDto.builder()
                                .reply(StringUtils.hasText(direct) ? direct.trim() : "Não consegui concluir a consulta.")
                                .links(collectedLinks)
                                .build();
                    }
                    history.add(LlmMessage.builder()
                            .role("tool")
                            .toolCallId(call.getId())
                            .name(call.getName())
                            .content(
                                    StringUtils.hasText(skillResult.getContentForModel())
                                            ? skillResult.getContentForModel()
                                            : "{\"ok\":false}")
                            .build());
                }
            }

            collectedLinks.addAll(linkByHref.values());
            String reply = response != null && StringUtils.hasText(response.getContent())
                    ? response.getContent().trim()
                    : "Posso ajudar a orientar o fluxo na tela. O que você precisa fazer?";

            LlmUsageSnapshot snapshot = usageTracker.snapshot(
                    response != null ? response.getProvider() : null,
                    response != null ? response.getModel() : null);
            return AssistantChatResponseDto.builder()
                    .reply(reply)
                    .provider(response != null ? response.getProvider() : null)
                    .model(response != null ? response.getModel() : null)
                    .usage(toUsageDto(snapshot))
                    .links(collectedLinks)
                    .build();
        } catch (BusinessException ex) {
            if (isAssistantGate(ex) || focusedFollowUp) {
                throw ex;
            }
            AssistantChatResponseDto catalogFallback = guideFromCatalog(latestUser, false, false);
            if (catalogFallback != null) {
                log.warn("Assistant business failure; using catalog guide fallback: {}", ex.getMessage());
                return catalogFallback;
            }
            logAndMask(ex);
            throw AssistantException.genericFailure();
        } catch (RuntimeException ex) {
            if (!focusedFollowUp) {
                AssistantChatResponseDto catalogFallback = guideFromCatalog(latestUser, false, false);
                if (catalogFallback != null) {
                    log.warn("Assistant runtime failure; using catalog guide fallback: {}", ex.getMessage());
                    return catalogFallback;
                }
            }
            logAndMask(ex);
            throw AssistantException.genericFailure();
        }
    }

    private AssistantChatResponseDto admissionDeadlineReply(String latestUser) {
        AssistantSkillResult result = admissionDeadlineAssistant.explainByDocument(latestUser);
        List<AssistantDeepLinkDto> links = result.getLinks() == null ? List.of() : result.getLinks();
        String reply = StringUtils.hasText(result.getContentForModel())
                ? result.getContentForModel().trim()
                : "Não consegui explicar o prazo desta admissão.";
        return AssistantChatResponseDto.builder().reply(reply).links(links).build();
    }

    /**
     * Recusa determinística de consulta por CPF no chat (PII), com deep link para a tela.
     */
    private AssistantChatResponseDto sensitiveLookupReply() {
        AssistantCatalogItem people = catalogLoader.findById("dp-people");
        String href = people != null && StringUtils.hasText(people.getHref())
                ? people.getHref()
                : "/collaborator/people";
        String reply =
                "Por segurança, não consulto nem resumo cadastro por **CPF** no chat.\n\n"
                        + "Abra **Colaboradores**, busque pelo CPF ou nome e veja os dados na tela.";
        return AssistantChatResponseDto.builder()
                .reply(reply)
                .links(List.of(AssistantDeepLinkDto.builder()
                        .label("Abrir Colaboradores")
                        .href(href)
                        .build()))
                .build();
    }

    /** Abertura pelo menu. As mensagens seguintes não usam o guia fixo de caminho. */
    private static boolean isFocusedFollowUp(AssistantMenuFocusDto focus) {
        return focus != null
                && !focus.isOpening()
                && (StringUtils.hasText(focus.getRouteId()) || StringUtils.hasText(focus.getLabel()));
    }

    private String systemInstruction(AssistantMenuFocusDto focus, boolean focusedFollowUp) {
        if (!focusedFollowUp) {
            return knowledgeLoader.systemPrompt();
        }
        AssistantCatalogItem item = catalogLoader.findForMenu(focus.getRouteId(), focus.getLabel());
        return knowledgeLoader.systemPrompt()
                + "\n\n"
                + AssistantMenuReply.modelContext(item, focus.getLabel());
    }

    private List<LlmTool> toolsFor(String latestUser, String menuLabel, boolean focusedFollowUp) {
        boolean vacation = VacationListingQuestion.matches(latestUser, menuLabel);
        boolean attendance = AttendanceListingQuestion.matches(latestUser, menuLabel);
        return skillRegistry.toolDefinitions().stream()
                .filter(tool -> tool != null)
                .filter(tool -> !focusedFollowUp || !"guide_flow".equals(tool.getName()))
                .filter(tool -> vacation || !"diagnose_vacation_listing".equals(tool.getName()))
                .filter(tool -> attendance || !"diagnose_attendance_listing".equals(tool.getName()))
                .toList();
    }

    /**
     * Só a primeira fala do menu. "Pra que serve?" nessa abertura explica a tela, sem o caminho.
     */
    private AssistantChatResponseDto replyForFocusedMenu(AssistantMenuFocusDto focus) {
        if (focus == null || !focus.isOpening()) {
            return null;
        }
        if (!StringUtils.hasText(focus.getRouteId()) && !StringUtils.hasText(focus.getLabel())) {
            return null;
        }
        AssistantCatalogItem item = catalogLoader.findForMenu(focus.getRouteId(), focus.getLabel());
        return AssistantMenuReply.build(item, focus.getLabel(), focus.getUserName(), true);
    }

    /**
     * Resposta de orientação a partir do catálogo (Sistema → Menu → Tópico), com passos e deep link.
     *
     * @param guideOnly when true, ignora itens EXECUTABLE (skills) — só orientação de tela.
     * @param requireGuidance when true, só responde se o item tiver explicações de negócio (guidance).
     */
    private AssistantChatResponseDto guideFromCatalog(
            String query, boolean guideOnly, boolean requireGuidance) {
        if (!StringUtils.hasText(query)) {
            return null;
        }
        List<AssistantCatalogItem> matches = catalogLoader.search(query, guideOnly ? 5 : 2);
        if (matches == null || matches.isEmpty()) {
            return null;
        }
        if (guideOnly) {
            matches = matches.stream()
                    .filter(item -> item.getComplexity() != AssistantCatalogComplexity.EXECUTABLE)
                    .limit(2)
                    .toList();
            if (matches.isEmpty()) {
                return null;
            }
        }
        AssistantCatalogItem primary = matches.getFirst();
        boolean hasGuidance = primary.getGuidance() != null
                && primary.getGuidance().stream().anyMatch(StringUtils::hasText);
        if (requireGuidance && !hasGuidance) {
            return null;
        }
        List<AssistantDeepLinkDto> links = new ArrayList<>();
        StringBuilder reply = new StringBuilder();
        if (hasGuidance) {
            reply.append("Sobre **")
                    .append(nullToDash(primary.getTopic()))
                    .append("** (")
                    .append(nullToDash(primary.getSystem()))
                    .append(" → ")
                    .append(nullToDash(primary.getMenu()))
                    .append("):\n\n");
            for (String line : primary.getGuidance()) {
                if (!StringUtils.hasText(line)) {
                    continue;
                }
                reply.append("- ").append(line.trim()).append('\n');
            }
            if (primary.getSteps() != null && !primary.getSteps().isEmpty()) {
                reply.append("\nComo usar:\n");
                int step = 1;
                for (String line : primary.getSteps()) {
                    if (!StringUtils.hasText(line)) {
                        continue;
                    }
                    reply.append(step++).append(". ").append(line.trim()).append('\n');
                }
            }
        } else {
            reply.append("Para **")
                    .append(StringUtils.hasText(primary.getAction()) ? primary.getAction() : primary.getTopic())
                    .append("**, siga este caminho no Gesint:\n\n");
            reply.append("- Sistema: **")
                    .append(nullToDash(primary.getSystem()))
                    .append("**\n");
            reply.append("- Menu: **")
                    .append(nullToDash(primary.getMenu()))
                    .append("**\n");
            reply.append("- Tela: **")
                    .append(nullToDash(primary.getTopic()))
                    .append("**\n");

            if (primary.getSteps() != null && !primary.getSteps().isEmpty()) {
                reply.append("\nPassos:\n");
                int step = 1;
                for (String line : primary.getSteps()) {
                    if (!StringUtils.hasText(line)) {
                        continue;
                    }
                    reply.append(step++).append(". ").append(line.trim()).append('\n');
                }
            }
        }

        if (StringUtils.hasText(primary.getHref())) {
            reply.append("\nUse o botão abaixo para abrir a tela.");
            links.add(AssistantDeepLinkDto.builder()
                    .label("Abrir " + nullToDash(primary.getTopic()))
                    .href(primary.getHref())
                    .build());
        } else {
            reply.append("\nEssa ação é feita na própria tela do módulo.");
        }

        return AssistantChatResponseDto.builder()
                .reply(reply.toString().trim())
                .links(links)
                .build();
    }

    private static String nullToDash(String value) {
        return StringUtils.hasText(value) ? value.trim() : "—";
    }

    private static String fallbackReplyFromSkills(
            List<String> skillSummaries, Iterable<AssistantDeepLinkDto> links) {
        if (skillSummaries != null) {
            for (String summary : skillSummaries) {
                if (StringUtils.hasText(summary) && !summary.trim().startsWith("{")) {
                    return summary.trim();
                }
            }
        }
        StringBuilder sb = new StringBuilder();
        sb.append(
                "Encontrei o fluxo correspondente no Gesint. Use o botão abaixo para abrir a tela "
                        + "e concluir por lá — ações complexas (como criar admissão) são feitas no módulo.");
        for (AssistantDeepLinkDto link : links) {
            if (link != null && StringUtils.hasText(link.getLabel())) {
                sb.append("\n\n→ **").append(link.getLabel()).append("**");
            }
        }
        if ((links == null || !links.iterator().hasNext())
                && skillSummaries != null
                && !skillSummaries.isEmpty()) {
            sb.append("\n\nConsulte a busca global do header se precisar localizar outra tela.");
        }
        return sb.toString();
    }

    private void ensureAssistantEnabled() {
        if (!multiTenantProperties.isEnabled()) {
            return;
        }
        TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
        if (tenant == null || tenant.isPlatformAccess() || tenant.isDevelopmentPublic()) {
            return;
        }
        UUID clientId = tenant.clientId();
        if (!contractedSystemsLookup.isAssistantEnabled(clientId)) {
            throw AssistantException.notEnabled();
        }
    }

    private AssistantSkillResult executeSkill(LlmToolCall call) {
        if (call == null || !StringUtils.hasText(call.getName())) {
            return AssistantSkillResult.builder()
                    .success(false)
                    .contentForModel("{\"error\":\"invalid_tool_call\"}")
                    .build();
        }
        AssistantActivity.report(activityLabel(call.getName()));
        AssistantSkill skill = skillRegistry.get(call.getName());
        if (skill == null) {
            return AssistantSkillResult.builder()
                    .success(false)
                    .contentForModel("{\"error\":\"unknown_skill\",\"name\":\"" + call.getName() + "\"}")
                    .build();
        }
        try {
            return skill.execute(call.getArgumentsJson());
        } catch (RuntimeException ex) {
            log.warn("Assistant skill {} failed: {}", call.getName(), ex.getMessage());
            errorLogWriter.write("Skill " + call.getName() + " failed", ex.getClass().getSimpleName());
            return AssistantSkillResult.builder()
                    .success(false)
                    .contentForModel(
                            "{\"error\":\"skill_failed\",\"message\":\"Não foi possível concluir esta ação.\"}")
                    .build();
        }
    }

    private static String activityLabel(String skillName) {
        if (skillName == null) {
            return "Consultando o sistema...";
        }
        return switch (skillName) {
            case "diagnose_vacation_listing" -> "Consultando férias...";
            case "diagnose_attendance_listing" -> "Consultando ponto...";
            case "summarize_admission" -> "Consultando admissão...";
            case "guide_flow" -> "Consultando o guia...";
            case "create_agenda_event" -> "Registrando na agenda...";
            default -> "Consultando o sistema...";
        };
    }

    private void logAndMask(Exception ex) {
        log.warn("Assistant chat failed: {}", ex.getMessage());
        errorLogWriter.write(
                truncate(ex.getMessage(), 400),
                ex.getClass().getSimpleName());
    }

    private static boolean isAssistantGate(BusinessException ex) {
        return "ASSISTANT_NOT_ENABLED".equals(ex.getCode())
                || "ASSISTANT_INVALID_MESSAGE".equals(ex.getCode())
                || "ASSISTANT_JAILBREAK".equals(ex.getCode())
                || "LLM_NOT_CONFIGURED".equals(ex.getCode());
    }

    private static AssistantLlmUsageDto toUsageDto(LlmUsageSnapshot snapshot) {
        LlmTokenUsage last = snapshot.getLast() != null ? snapshot.getLast() : LlmTokenUsage.empty();
        LlmTokenUsage session = snapshot.getSession() != null ? snapshot.getSession() : LlmTokenUsage.empty();
        return AssistantLlmUsageDto.builder()
                .lastPromptTokens(last.getPromptTokens())
                .lastCompletionTokens(last.getCompletionTokens())
                .lastTotalTokens(last.getTotalTokens())
                .sessionPromptTokens(session.getPromptTokens())
                .sessionCompletionTokens(session.getCompletionTokens())
                .sessionTotalTokens(session.getTotalTokens())
                .sessionRequests(snapshot.getSessionRequests())
                .dailyTokenLimit(snapshot.getDailyTokenLimit())
                .modelInputTokenLimit(snapshot.getModelInputTokenLimit())
                .modelOutputTokenLimit(snapshot.getModelOutputTokenLimit())
                .build();
    }

    private String latestUserContent(List<LlmMessage> messages) {
        for (int i = messages.size() - 1; i >= 0; i--) {
            LlmMessage message = messages.get(i);
            if ("user".equals(message.getRole())) {
                return message.getContent();
            }
        }
        return "";
    }

    private List<LlmMessage> toLlmMessages(List<AssistantChatMessageDto> incoming) {
        List<LlmMessage> messages = new ArrayList<>();
        if (incoming == null) {
            return messages;
        }
        for (AssistantChatMessageDto item : incoming) {
            if (item == null || !StringUtils.hasText(item.getContent()) || !StringUtils.hasText(item.getRole())) {
                continue;
            }
            String role = item.getRole().trim().toLowerCase(Locale.ROOT);
            if (!"user".equals(role) && !"assistant".equals(role)) {
                continue;
            }
            messages.add(LlmMessage.builder().role(role).content(item.getContent().trim()).build());
        }
        return messages;
    }

    private List<LlmMessage> trimHistory(List<LlmMessage> messages, int maxMessages) {
        if (messages.size() <= maxMessages) {
            return new ArrayList<>(messages);
        }
        return new ArrayList<>(messages.subList(messages.size() - maxMessages, messages.size()));
    }

    private static String truncate(String value, int max) {
        if (!StringUtils.hasText(value)) {
            return "assistant_failure";
        }
        String trimmed = value.trim();
        return trimmed.length() > max ? trimmed.substring(0, max) : trimmed;
    }
}
