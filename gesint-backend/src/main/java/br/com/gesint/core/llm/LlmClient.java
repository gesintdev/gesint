package br.com.gesint.core.llm;

public interface LlmClient {

    LlmResponse complete(LlmRequest request);
}
