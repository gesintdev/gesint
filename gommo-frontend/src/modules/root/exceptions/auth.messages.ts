/**
 * Mensagens do módulo Auth (Unicode apenas em caracteres especiais).
 */
export const AUTH_MESSAGES = {
    AUTH_INVALID_CREDENTIALS: "Usu\u00e1rio ou senha inv\u00e1lidos",
    AUTH_INVALID_REFRESH: "Sess\u00e3o expirada. Fa\u00e7a login novamente",
    AUTH_REVOKED_REFRESH: "Sess\u00e3o expirada. Fa\u00e7a login novamente",
    AUTH_EXPIRED_REFRESH: "Sess\u00e3o expirada. Fa\u00e7a login novamente",
    AUTH_USER_NOT_FOUND: "Usu\u00e1rio n\u00e3o encontrado",
    AUTH_NO_ACTIVE_SYSTEM:
        "N\u00e3o foi poss\u00edvel acessar o sistema. Entre em contato com seu departamento administrativo",
    AUTH_INVALID_ACCESS_TOKEN: "Token de acesso inv\u00e1lido",
    AUTH_PASSWORD_MISMATCH: "A senha e a confirma\u00e7\u00e3o n\u00e3o conferem",
    AUTH_PASSWORD_TOO_SHORT: "A senha deve ter no m\u00ednimo 8 caracteres",
    AUTH_ERROR: "Falha na autentica\u00e7\u00e3o",
} as const;
/** Exclusivas do frontend */
export const AUTH_CLIENT_MESSAGES = {
    AUTH_SESSION_EXPIRED: "Sess\u00e3o expirada. Fa\u00e7a login novamente",
} as const;
