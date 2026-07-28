package br.com.gommo.modules.root.assistant.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import br.com.gommo.core.llm.LlmClient;
import br.com.gommo.core.llm.LlmMessage;
import br.com.gommo.core.llm.LlmPurpose;
import br.com.gommo.core.llm.LlmRequest;
import br.com.gommo.core.llm.LlmResponse;
import br.com.gommo.core.llm.LlmTokenUsage;
import br.com.gommo.core.llm.LlmUsageSnapshot;
import br.com.gommo.core.llm.LlmUsageTracker;
import br.com.gommo.modules.root.assistant.dto.AssistantChatMessageDto;
import br.com.gommo.modules.root.assistant.dto.AssistantChatRequestDto;
import br.com.gommo.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gommo.modules.root.assistant.dto.AssistantLlmUsageDto;
import br.com.gommo.modules.root.assistant.exception.AssistantException;
import br.com.gommo.modules.root.assistant.knowledge.AssistantContextSelector;
import br.com.gommo.modules.root.assistant.knowledge.AssistantKnowledgeLoader;

@Service
public class AssistantChatService implements IAssistantChatService {

    private static final int MAX_HISTORY_MESSAGES = 12;
    private static final int MAX_HISTORY_SMALL_TALK = 1;

    private final LlmClient llmClient;
    private final AssistantKnowledgeLoader knowledgeLoader;
    private final AssistantContextSelector contextSelector;
    private final LlmUsageTracker usageTracker;

    public AssistantChatService(
            LlmClient llmClient,
            AssistantKnowledgeLoader knowledgeLoader,
            AssistantContextSelector contextSelector,
            LlmUsageTracker usageTracker) {
        this.llmClient = llmClient;
        this.knowledgeLoader = knowledgeLoader;
        this.contextSelector = contextSelector;
        this.usageTracker = usageTracker;
    }

    @Override
    public AssistantChatResponseDto chat(AssistantChatRequestDto request) {
        List<LlmMessage> messages = toLlmMessages(request.getMessages());
        if (messages.isEmpty()) {
            throw AssistantException.invalidMessage();
        }
        // Gemini exige que o histórico de contents comece com papel user.
        while (!messages.isEmpty() && !"user".equals(messages.getFirst().getRole())) {
            messages.removeFirst();
        }
        boolean hasUser = messages.stream().anyMatch(message -> "user".equals(message.getRole()));
        if (!hasUser) {
            throw AssistantException.invalidMessage();
        }

        String latestUser = latestUserContent(messages);
        boolean includeRoutes = contextSelector.needsRouteGuide(latestUser);
        boolean smallTalk = contextSelector.isSmallTalk(latestUser);
        List<LlmMessage> history = trimHistory(messages, smallTalk ? MAX_HISTORY_SMALL_TALK : MAX_HISTORY_MESSAGES);

        LlmResponse response = llmClient.complete(LlmRequest.builder()
                .purpose(LlmPurpose.SUPPORT_CHAT)
                .systemInstruction(knowledgeLoader.systemInstruction(includeRoutes))
                .messages(history)
                .build());

        LlmUsageSnapshot snapshot = usageTracker.snapshot(response.getProvider(), response.getModel());
        return AssistantChatResponseDto.builder()
                .reply(response.getContent())
                .provider(response.getProvider())
                .model(response.getModel())
                .usage(toUsageDto(snapshot))
                .build();
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
            return messages;
        }
        return messages.subList(messages.size() - maxMessages, messages.size());
    }
}
