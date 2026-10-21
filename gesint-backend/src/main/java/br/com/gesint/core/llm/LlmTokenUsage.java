package br.com.gesint.core.llm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmTokenUsage {

    private int promptTokens;
    private int completionTokens;
    private int totalTokens;

    public static LlmTokenUsage empty() {
        return LlmTokenUsage.builder().build();
    }

    public static LlmTokenUsage of(int promptTokens, int completionTokens, int totalTokens) {
        int safePrompt = Math.max(0, promptTokens);
        int safeCompletion = Math.max(0, completionTokens);
        int safeTotal = totalTokens > 0 ? totalTokens : safePrompt + safeCompletion;
        return LlmTokenUsage.builder()
                .promptTokens(safePrompt)
                .completionTokens(safeCompletion)
                .totalTokens(safeTotal)
                .build();
    }
}
