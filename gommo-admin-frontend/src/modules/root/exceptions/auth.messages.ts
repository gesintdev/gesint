/**
 * Mensagens do módulo Auth (Unicode apenas em caracteres especiais).
 */
export const AUTH_MESSAGES = {
    AUTH_INVALID_CREDENTIALS: "Usu\u00e1rio ou senha inv\u00e1lidos",
    AUTH_INVALID_REFRESH: "Sess\u00e3o expirada. Fa\u00e7a login novamente",
    AUTH_REVOKED_REFRESH: "Sess\u00e3o expirada. Fa\u00e7a login novamente",
    AUTH_EXPIRED_REFRESH: "Sess\u00e3o expirada. Fa\u00e7a login novamente",
    AUTH_USER_NOT_FOUND: "Usu\u00e1rio n\u00e3o encontrado",
    AUTH_ERROR: "Falha na autentica\u00e7\u00e3o",
} as const;
/** Exclusivas do frontend */
export const AUTH_CLIENT_MESSAGES = {
    AUTH_SESSION_EXPIRED: "Sess\u00e3o expirada. Fa\u00e7a login novamente",
} as const;
