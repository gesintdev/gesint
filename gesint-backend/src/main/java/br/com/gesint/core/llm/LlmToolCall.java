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
public class LlmToolCall {

    private String id;
    private String name;
    /** Argumentos JSON serializados. */
    private String argumentsJson;

    /**
     * Assinatura de pensamento do Gemini 3+ (campo {@code thoughtSignature} no part).
     * Precisa ser reenviada no histórico ao ecoar o functionCall, senão a API retorna 400.
     */
    private String thoughtSignature;
}
