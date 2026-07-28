package br.com.gommo.core.llm;

public interface LlmClient {

    LlmResponse complete(LlmRequest request);
}
