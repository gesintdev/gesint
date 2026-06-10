package br.com.gommo.admin.core.exception;

/**
 * Catálogo de mensagens do núcleo (Unicode apenas em caracteres especiais).
 */
public final class CoreExceptions {

    private CoreExceptions() {}

    public static final String VALIDATION_ERROR_CODE = "VALIDATION_ERROR";
    public static final String VALIDATION_ERROR_MSG = "Erro de valida\u00e7\u00e3o";

    public static final String INTERNAL_ERROR_CODE = "INTERNAL_ERROR";
    public static final String INTERNAL_ERROR_MSG = "Ocorreu um erro inesperado";

    public static final String FORBIDDEN_CODE = "FORBIDDEN";
    public static final String FORBIDDEN_MSG = "Voc\u00ea n\u00e3o tem permiss\u00e3o para esta a\u00e7\u00e3o";
}
