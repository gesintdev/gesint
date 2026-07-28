package br.com.gommo.core.llm;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.stereotype.Component;

@Component
public class LlmUsageTracker {

    private final LlmProperties properties;
    private final AtomicInteger sessionPromptTokens = new AtomicInteger();
    private final AtomicInteger sessionCompletionTokens = new AtomicInteger();
    private final AtomicInteger sessionTotalTokens = new AtomicInteger();
    private final AtomicLong sessionRequests = new AtomicLong();
    private final AtomicReference<LlmTokenUsage> lastUsage = new AtomicReference<>(LlmTokenUsage.empty());
    private final AtomicReference<Integer> modelInputTokenLimit = new AtomicReference<>();
    private final AtomicReference<Integer> modelOutputTokenLimit = new AtomicReference<>();

    public LlmUsageTracker(LlmProperties properties) {
        this.properties = properties;
    }

    public void record(LlmTokenUsage usage) {
        if (usage == null) {
            return;
        }
        lastUsage.set(usage);
        sessionPromptTokens.addAndGet(usage.getPromptTokens());
        sessionCompletionTokens.addAndGet(usage.getCompletionTokens());
        sessionTotalTokens.addAndGet(usage.getTotalTokens());
        sessionRequests.incrementAndGet();
    }

    public void rememberModelLimits(Integer inputTokenLimit, Integer outputTokenLimit) {
        if (inputTokenLimit != null && inputTokenLimit > 0) {
            modelInputTokenLimit.set(inputTokenLimit);
        }
        if (outputTokenLimit != null && outputTokenLimit > 0) {
            modelOutputTokenLimit.set(outputTokenLimit);
        }
    }

    public LlmUsageSnapshot snapshot(String provider, String model) {
        Integer configuredDailyLimit =
                properties.getDailyTokenLimit() != null && properties.getDailyTokenLimit() > 0
                        ? properties.getDailyTokenLimit()
                        : null;
        return LlmUsageSnapshot.builder()
                .last(lastUsage.get())
                .session(LlmTokenUsage.of(
                        sessionPromptTokens.get(),
                        sessionCompletionTokens.get(),
                        sessionTotalTokens.get()))
                .sessionRequests(sessionRequests.get())
                .dailyTokenLimit(configuredDailyLimit)
                .modelInputTokenLimit(modelInputTokenLimit.get())
                .modelOutputTokenLimit(modelOutputTokenLimit.get())
                .provider(provider)
                .model(model)
                .build();
    }
}
