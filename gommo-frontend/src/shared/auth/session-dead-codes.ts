import { AppException } from "@/shared/exceptions/app.exception";

/**
 * Códigos em que a sessão realmente acabou (refresh revogado/expirado, FORCE_LOGOUT).
 * Qualquer outro erro — 5xx, timeout, 401 genérico — é transitório e NÃO deve deslogar.
 */
const SESSION_DEAD_CODES = new Set([
    "AUTH_REVOKED_REFRESH",
    "AUTH_INVALID_REFRESH",
    "AUTH_EXPIRED_REFRESH",
    "AUTH_SESSION_EXPIRED",
]);

export function isSessionDeadCode(code: string | undefined | null): boolean {
    return Boolean(code) && SESSION_DEAD_CODES.has(String(code));
}

export function isSessionDeadError(error: unknown): boolean {
    return error instanceof AppException && isSessionDeadCode(error.code);
}
