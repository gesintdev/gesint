package br.com.gommo.modules.root.assistant.log;

public interface AssistantErrorLogWriter {

    /**
     * Grava falha do assistente no schema admin. Nunca persistir payload de mensagem do usuário.
     */
    void write(String summary, String errorClass);
}
