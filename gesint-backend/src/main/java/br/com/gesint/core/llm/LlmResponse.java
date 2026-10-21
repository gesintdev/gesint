package br.com.gesint.core.llm;

import java.util.ArrayList;
import java.util.List;

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
public class LlmResponse {

    private String content;
    private String provider;
    private String model;
    private LlmTokenUsage usage;

    @Builder.Default
    private List<LlmToolCall> toolCalls = new ArrayList<>();

    public boolean hasToolCalls() {
        return toolCalls != null && !toolCalls.isEmpty();
    }
}
