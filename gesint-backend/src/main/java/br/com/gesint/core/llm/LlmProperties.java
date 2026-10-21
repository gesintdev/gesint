package br.com.gesint.core.llm;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "gesint.llm")
public class LlmProperties {

    /** gemini | openai */
    private String provider = "gemini";

    private String model = "gemini-flash-lite-latest";

    private String apiKey = "";

    private String geminiBaseUrl = "https://generativelanguage.googleapis.com/v1beta";

    private String openaiBaseUrl = "https://api.openai.com/v1";

    private double temperature = 0.3;

    private int maxOutputTokens = 1024;

    /**
     * Soft daily token budget for the dev usage footer.
     * Google does not expose remaining quota via API key; set this from AI Studio rate limits.
     */
    private Integer dailyTokenLimit;
}
