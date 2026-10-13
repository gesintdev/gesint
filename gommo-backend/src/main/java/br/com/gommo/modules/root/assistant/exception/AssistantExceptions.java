package br.com.gommo.modules.root.assistant.exception;

public final class AssistantExceptions {

    private AssistantExceptions() {}

    public static final String INVALID_MESSAGE_CODE = "ASSISTANT_INVALID_MESSAGE";
    public static final String INVALID_MESSAGE_MSG = "Mensagem inválida para o assistente";

    public static final String NOT_ENABLED_CODE = "ASSISTANT_NOT_ENABLED";
    public static final String NOT_ENABLED_MSG = "Assistente de I.A. não está habilitado neste contrato";

    public static final String JAILBREAK_CODE = "ASSISTANT_JAILBREAK";
    public static final String JAILBREAK_MSG =
            "Não posso ajudar com esse tipo de pedido. Use o sistema dentro das permissões do seu perfil.";

    public static final String GENERIC_FAILURE_CODE = "ASSISTANT_FAILURE";
    public static final String GENERIC_FAILURE_MSG =
            "Não foi possível concluir. Tente de novo ou use a tela correspondente.";
}
