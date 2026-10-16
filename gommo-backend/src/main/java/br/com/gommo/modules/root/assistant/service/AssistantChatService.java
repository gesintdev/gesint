package br.com.gommo.modules.root.assistant.service;

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

import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.core.llm.LlmClient;
import br.com.gommo.core.llm.LlmMessage;
import br.com.gommo.core.llm.LlmPurpose;
import br.com.gommo.core.llm.LlmRequest;
import br.com.gommo.core.llm.LlmResponse;
import br.com.gommo.core.llm.LlmTokenUsage;
import br.com.gommo.core.llm.LlmToolCall;
import br.com.gommo.core.llm.LlmUsageSnapshot;
import br.com.gommo.core.llm.LlmUsageTracker;
import br.com.gommo.core.tenant.MultiTenantProperties;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.core.tenant.TenantContractedSystemsLookup;
import br.com.gommo.modules.root.assistant.dto.AssistantChatMessageDto;
import br.com.gommo.modules.root.assistant.dto.AssistantChatRequestDto;
import br.com.gommo.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gommo.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gommo.modules.root.assistant.dto.AssistantLlmUsageDto;
import br.com.gommo.modules.root.assistant.exception.AssistantException;
import br.com.gommo.modules.root.assistant.guard.AssistantJailbreakDetector;
import br.com.gommo.modules.root.assistant.knowledge.AssistantCatalogComplexity;
import br.com.gommo.modules.root.assistant.knowledge.AssistantCatalogItem;
import br.com.gommo.modules.root.assistant.knowledge.AssistantContextSelector;
import br.com.gommo.modules.root.assistant.knowledge.AssistantKnowledgeCatalogLoader;
import br.com.gommo.modules.root.assistant.knowledge.AssistantKnowledgeLoader;
import br.com.gommo.modules.root.assistant.log.AssistantErrorLogWriter;
import br.com.gommo.modules.root.assistant.skill.AssistantSkill;
import br.com.gommo.modules.root.assistant.skill.AssistantSkillRegistry;
import br.com.gommo.modules.root.assistant.skill.AssistantSkillResult;

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
            MultiTenantProperties multiTenantProperties) {
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

        // Consulta por CPF: não devolve dado sensível no chat; orienta a tela certa.
        if (contextSelector.looksLikeCpfLookup(latestUser)) {
            return sensitiveLookupReply();
        }

        // Orientação de tela pelo catálogo (determinística): navegação ou "por que a tela é assim".
        if (contextSelector.needsRouteGuide(latestUser)) {
            AssistantChatResponseDto catalogGuide = guideFromCatalog(latestUser, true, false);
            if (catalogGuide != null) {
                return catalogGuide;
            }
        }
        if (contextSelector.needsModuleGuidance(latestUser)) {
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
                try {
                    response = llmClient.complete(LlmRequest.builder()
                            .purpose(LlmPurpose.SUPPORT_CHAT)
                            .systemInstruction(knowledgeLoader.systemPrompt())
                            .messages(history)
                            .tools(skillRegistry.toolDefinitions())
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
                    AssistantChatResponseDto catalogFallback = guideFromCatalog(latestUser, false, false);
                    if (catalogFallback != null) {
                        log.warn("Assistant LLM failed; using catalog guide fallback: {}", ex.getMessage());
                        return catalogFallback;
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
            if (isAssistantGate(ex)) {
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
            AssistantChatResponseDto catalogFallback = guideFromCatalog(latestUser, false, false);
            if (catalogFallback != null) {
                log.warn("Assistant runtime failure; using catalog guide fallback: {}", ex.getMessage());
                return catalogFallback;
            }
            logAndMask(ex);
            throw AssistantException.genericFailure();
        }
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
