package br.com.gommo.admin.modules.root.exception;

public final class AuthExceptions {

    private AuthExceptions() {}

    public static final String INVALID_CREDENTIALS_CODE = "AUTH_INVALID_CREDENTIALS";
    public static final String INVALID_CREDENTIALS_MSG = "Usuário ou senha inválidos";

    public static final String INVALID_REFRESH_CODE = "AUTH_INVALID_REFRESH";
    public static final String INVALID_REFRESH_MSG = "Token de atualização inválido";

    public static final String REVOKED_REFRESH_CODE = "AUTH_REVOKED_REFRESH";
    public static final String REVOKED_REFRESH_MSG = "Sessão expirada. Faça login novamente";

    public static final String EXPIRED_REFRESH_CODE = "AUTH_EXPIRED_REFRESH";
    public static final String EXPIRED_REFRESH_MSG = "Sessão expirada. Faça login novamente";

    public static final String USER_NOT_FOUND_CODE = "AUTH_USER_NOT_FOUND";
    public static final String USER_NOT_FOUND_MSG = "Usuário não encontrado";
}
