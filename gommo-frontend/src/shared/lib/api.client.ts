import {AppException} from "@/shared/exceptions/app.exception";
import type {ErrorResponseDto} from "@/shared/exceptions/error-response.dto";
import {AUTH_CLIENT_MESSAGES} from "@/modules/root/exceptions/auth.messages";
import {signOutToTenantLogin} from "@/shared/lib/sign-out.client";
import {buildTenantRequestHeaders, resolveTenantSlugFromHostname} from "@/shared/lib/tenant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export {AppException, ApiError} from "@/shared/exceptions/app.exception";

type RequestOptions = {
    method?: string;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
    /** Uso interno: evita loop ao renovar token após 401/403 */
    _retry?: boolean;
};

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
}

async function resolveAuthToken(explicit?: string | null): Promise<string | null> {
    if (explicit) return explicit;
    if (authToken) return authToken;
    if (typeof window === "undefined") return null;
    const {getSession} = await import("next-auth/react");
    const session = await getSession();
    const token = session?.accessToken ?? null;
    if (token) setAuthToken(token);
    return token;
}

async function refreshSessionTokens(options?: { forceBackendRefresh?: boolean }): Promise<string | null> {
    authToken = null;
    if (typeof window === "undefined") return null;

    const {getSession} = await import("next-auth/react");
    const session = await getSession();

    if (session?.error === "RefreshAccessTokenError" || session?.error === "RefreshTokenMissing") {
        signOutToTenantLogin();
        return null;
    }

    if (session?.refreshToken) {
        const refreshed = await refreshAccessTokenFromBackend(
            session.refreshToken,
            session.tenantSlug,
        );
        if (refreshed) {
            setAuthToken(refreshed);
            return refreshed;
        }
    }

    if (options?.forceBackendRefresh) {
        return null;
    }

    const token = session?.accessToken ?? null;
    if (token) setAuthToken(token);
    return token;
}

async function resolveClientTenantHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
    const fromExtra = extra?.["X-Tenant-Slug"];
    if (fromExtra) {
        return {
            ...buildTenantRequestHeaders(fromExtra),
            ...extra,
        };
    }

    const fromHost = typeof window !== "undefined" ? resolveTenantSlugFromHostname() : null;
    if (fromHost) {
        return {
            ...buildTenantRequestHeaders(fromHost),
            ...extra,
        };
    }

    if (typeof window !== "undefined") {
        const {getSession} = await import("next-auth/react");
        const session = await getSession();
        if (session?.tenantSlug) {
            return {
                ...buildTenantRequestHeaders(session.tenantSlug),
                ...extra,
            };
        }
    }

    return {...extra};
}

async function refreshAccessTokenFromBackend(
    refreshToken: string,
    tenantSlug?: string | null,
): Promise<string | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...buildTenantRequestHeaders(tenantSlug),
            },
            body: JSON.stringify({refreshToken}),
            cache: "no-store",
        });
        if (!response.ok) return null;
        const data = (await response.json()) as {accessToken: string};
        return data.accessToken ?? null;
    } catch {
        return null;
    }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {method = "GET", body, token, headers = {}, _retry = false} = options;
    const correlationId = crypto.randomUUID();
    const bearer = await resolveAuthToken(token);

    const tenantHeaders = await resolveClientTenantHeaders(headers);

    const doFetch = (authHeader: string | null) =>
        fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                "X-Correlation-ID": correlationId,
                ...(authHeader ? {Authorization: `Bearer ${authHeader}`} : {}),
                ...tenantHeaders,
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            cache: "no-store",
        });

    let response = await doFetch(bearer);

    if (
        !_retry &&
        (response.status === 401 || response.status === 403) &&
        typeof window !== "undefined" &&
        !path.startsWith("/api/v1/auth/")
    ) {
        const newToken = await refreshSessionTokens({
            forceBackendRefresh: response.status === 403,
        });
        if (!newToken) {
            throw AppException.client(
                "AUTH_SESSION_EXPIRED",
                AUTH_CLIENT_MESSAGES.AUTH_SESSION_EXPIRED,
                401,
            );
        }
        if (newToken !== bearer) {
            response = await doFetch(newToken);
            if (response.ok) {
                return parseResponse<T>(response);
            }
        }
        return handleErrorResponse(response);
    }

    if (!response.ok) {
        return handleErrorResponse(response);
    }

    return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        return undefined as T;
    }
    return (await response.json()) as T;
}

async function handleErrorResponse(response: Response): Promise<never> {
    let payload: ErrorResponseDto = {
        code: "UNKNOWN",
        message: response.statusText,
    };

    try {
        const body = (await response.json()) as Partial<ErrorResponseDto>;
        payload = {
            code: body.code ?? payload.code,
            message: body.message ?? payload.message,
            correlationId: body.correlationId,
            timestamp: body.timestamp,
        };
    } catch {
        // resposta sem JSON
    }

    throw AppException.fromApiResponse(payload, response.status);
}
