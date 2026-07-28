package br.com.gommo.modules.root.assistant.dto;

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
public class AssistantLlmUsageDto {

    private Integer lastPromptTokens;
    private Integer lastCompletionTokens;
    private Integer lastTotalTokens;
    private Integer sessionPromptTokens;
    private Integer sessionCompletionTokens;
    private Integer sessionTotalTokens;
    private Long sessionRequests;
    private Integer dailyTokenLimit;
    private Integer modelInputTokenLimit;
    private Integer modelOutputTokenLimit;
}
