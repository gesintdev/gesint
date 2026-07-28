package br.com.gommo.core.llm;

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
public class LlmRequest {

    private LlmPurpose purpose;

    /** Instrução de sistema (papel + conhecimento do Gommo). */
    private String systemInstruction;

    @Builder.Default
    private List<LlmMessage> messages = new ArrayList<>();

    private Double temperature;

    private Integer maxOutputTokens;
}
