package br.com.gommo.modules.root.exception;

/**
 * Catálogo de mensagens do módulo Auth (Unicode apenas em caracteres especiais).
 */
public final class AuthExceptions {

    private AuthExceptions() {}

    public static final String INVALID_CREDENTIALS_CODE = "AUTH_INVALID_CREDENTIALS";
    public static final String INVALID_CREDENTIALS_MSG = "Usu\u00e1rio ou senha inv\u00e1lidos";

    public static final String INVALID_REFRESH_CODE = "AUTH_INVALID_REFRESH";
    public static final String INVALID_REFRESH_MSG = "Token de atualiza\u00e7\u00e3o inv\u00e1lido";

    public static final String REVOKED_REFRESH_CODE = "AUTH_REVOKED_REFRESH";
    public static final String REVOKED_REFRESH_MSG = "Sess\u00e3o expirada. Fa\u00e7a login novamente";

    public static final String EXPIRED_REFRESH_CODE = "AUTH_EXPIRED_REFRESH";
    public static final String EXPIRED_REFRESH_MSG = "Sess\u00e3o expirada. Fa\u00e7a login novamente";

    public static final String USER_NOT_FOUND_CODE = "AUTH_USER_NOT_FOUND";
    public static final String USER_NOT_FOUND_MSG = "Usu\u00e1rio n\u00e3o encontrado";

    public static final String NO_ACTIVE_SYSTEM_CODE = "AUTH_NO_ACTIVE_SYSTEM";
    public static final String NO_ACTIVE_SYSTEM_MSG =
            "N\u00e3o foi poss\u00edvel acessar o sistema. Entre em contato com seu departamento administrativo";
}
