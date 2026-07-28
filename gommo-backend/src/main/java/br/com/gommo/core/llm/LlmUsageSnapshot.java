package br.com.gommo.core.llm;

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
public class LlmUsageSnapshot {

    private LlmTokenUsage last;
    private LlmTokenUsage session;
    private long sessionRequests;
    /** Soft budget from LLM_DAILY_TOKEN_LIMIT (Google does not expose remaining quota via API key). */
    private Integer dailyTokenLimit;
    /** Context window of the configured model (from models.get). */
    private Integer modelInputTokenLimit;
    private Integer modelOutputTokenLimit;
    private String model;
    private String provider;
}
