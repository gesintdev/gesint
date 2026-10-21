package br.com.gesint.core.llm;

public final class LlmExceptions {

    private LlmExceptions() {}

    public static final String NOT_CONFIGURED_CODE = "LLM_NOT_CONFIGURED";
    public static final String NOT_CONFIGURED_MSG =
            "Integração de IA não configurada. Defina LLM_API_KEY no ambiente.";

    public static final String PROVIDER_UNSUPPORTED_CODE = "LLM_PROVIDER_UNSUPPORTED";
    public static final String PROVIDER_UNSUPPORTED_MSG = "Provedor de IA não suportado";

    public static final String CALL_FAILED_CODE = "LLM_CALL_FAILED";
    public static final String CALL_FAILED_MSG = "Falha ao consultar o provedor de IA";

    public static final String QUOTA_EXCEEDED_CODE = "LLM_QUOTA_EXCEEDED";
    public static final String QUOTA_EXCEEDED_MSG =
            "Cota do Gemini esgotada (free tier). Aguarde o reset, troque o modelo em LLM_MODEL ou ative billing no Google AI Studio.";

    public static final String MODEL_NOT_FOUND_CODE = "LLM_MODEL_NOT_FOUND";
    public static final String MODEL_NOT_FOUND_MSG =
            "Modelo Gemini não encontrado. Ajuste LLM_MODEL para um ID válido da sua conta (ex.: gemini-2.5-flash).";

    public static final String EMPTY_RESPONSE_CODE = "LLM_EMPTY_RESPONSE";
    public static final String EMPTY_RESPONSE_MSG = "O provedor de IA retornou resposta vazia";
}
