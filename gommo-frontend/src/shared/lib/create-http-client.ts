import { AUTH_CLIENT_MESSAGES } from "@/modules/root/exceptions/auth.messages";
import { AppException } from "@/shared/exceptions/app.exception";
import type { ErrorResponseDto } from "@/shared/exceptions/error-response.dto";

export type DoRequestOptions = {
    method?: string;
    /** JSON serializavel ou FormData */
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
    /** Nao tenta refresh automatico (ex.: /auth/refresh) */
    skipAuthRetry?: boolean;
    /** Nao envia Authorization */
    skipAuth?: boolean;
    responseType?: "json" | "blob" | "void";
};

export type HttpClientConfig = {
    baseUrl: string;
    resolveExtraHeaders?: (headers?: Record<string, string>) => Promise<Record<string, string>>;
    onSessionExpired?: () => void;
};

export function createHttpClient(config: HttpClientConfig) {
    let authToken: string | null = null;
    function setAuthToken(token: string | null) {
        authToken = token;
    }
    async function resolveAuthToken(explicit?: string | null): Promise<string | null> {
        if (explicit) return explicit;
        if (authToken) return authToken;
        if (typeof window === "undefined") return null;
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const token = session?.accessToken ?? null;
        if (token) setAuthToken(token);
        return token;
    }
    async function refreshSessionTokens(): Promise<string | null> {
        authToken = null;
        if (typeof window === "undefined") return null;
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        if (session?.error === "RefreshAccessTokenError" || session?.error === "RefreshTokenMissing") {
            config.onSessionExpired?.();
            return null;
        }
        const token = session?.accessToken ?? null;
        if (token) setAuthToken(token);
        return token;
    }
    async function buildRequestHeaders(
        options: DoRequestOptions,
        authHeader: string | null,
    ): Promise<Record<string, string>> {
        const correlationId = crypto.randomUUID();
        const extra = options.headers ?? {};
        const contextual = config.resolveExtraHeaders ? await config.resolveExtraHeaders(extra) : extra;
        const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
        return {
            "X-Correlation-ID": correlationId,
            ...(isFormData || options.body === undefined ? {} : { "Content-Type": "application/json" }),
            ...(!options.skipAuth && authHeader ? { Authorization: `Bearer ${authHeader}` } : {}),
            ...contextual,
        };
    }
    function buildBody(body: unknown): BodyInit | undefined {
        if (body === undefined) return undefined;
        if (typeof FormData !== "undefined" && body instanceof FormData) {
            return body;
        }
        return JSON.stringify(body);
    }
    async function parseResponse<T>(response: Response, responseType: DoRequestOptions["responseType"]): Promise<T> {
        if (responseType === "void" || response.status === 204) {
            return undefined as T;
        }

        if (responseType === "blob") {
            return (await response.blob()) as T;
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
    async function doRequest<T>(path: string, options: DoRequestOptions = {}): Promise<T> {
        const { method = "GET", body, token, skipAuthRetry = false, skipAuth = false, responseType = "json" } = options;
        const bearer = skipAuth ? null : await resolveAuthToken(token);
        const execute = async (authHeader: string | null) =>
            fetch(`${config.baseUrl}${path}`, {
                method,
                headers: await buildRequestHeaders(options, authHeader),
                body: buildBody(body),
                cache: "no-store",
            });
        let response = await execute(bearer);
        if (
            !skipAuthRetry &&
            !skipAuth &&
            (response.status === 401 || response.status === 403) &&
            typeof window !== "undefined" &&
            !path.startsWith("/api/v1/auth/")
        ) {
            const newToken = await refreshSessionTokens();
            if (!newToken) {
                if (response.status === 401) {
                    throw AppException.client("AUTH_SESSION_EXPIRED", AUTH_CLIENT_MESSAGES.AUTH_SESSION_EXPIRED, 401);
                }
                return handleErrorResponse(response);
            }

            if (newToken !== bearer) {
                response = await execute(newToken);
                if (response.ok) {
                    return parseResponse<T>(response, responseType);
                }
            }
            return handleErrorResponse(response);
        }

        if (!response.ok) {
            return handleErrorResponse(response);
        }
        return parseResponse<T>(response, responseType);
    }
    async function apiFetch<T>(path: string, options: Omit<DoRequestOptions, "responseType"> = {}): Promise<T> {
        return doRequest<T>(path, { ...options, responseType: "json" });
    }
    return {
        doRequest,
        apiFetch,
        setAuthToken,
        resolveAuthToken,
        refreshSessionTokens,
    };
}
