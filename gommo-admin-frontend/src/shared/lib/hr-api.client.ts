import {AppException} from "@/shared/exceptions/app.exception";
import type {ErrorResponseDto} from "@/shared/exceptions/error-response.dto";
import {AUTH_CLIENT_MESSAGES} from "@/modules/root/exceptions/auth.messages";

const HR_API_BASE_URL = process.env.NEXT_PUBLIC_HR_API_URL ?? "http://localhost:8081";

export {AppException, ApiError} from "@/shared/exceptions/app.exception";

type RequestOptions = {
    method?: string;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
    _retry?: boolean;
};

let authToken: string | null = null;

export function setHrAuthToken(token: string | null) {
    authToken = token;
}

async function resolveAuthToken(explicit?: string | null): Promise<string | null> {
    if (explicit) return explicit;
    if (authToken) return authToken;
    if (typeof window === "undefined") return null;
    const {getSession} = await import("next-auth/react");
    const session = await getSession();
    const token = session?.accessToken ?? null;
    if (token) setHrAuthToken(token);
    return token;
}

async function refreshSessionTokens(): Promise<string | null> {
    authToken = null;
    if (typeof window === "undefined") return null;

    const {getSession, signOut} = await import("next-auth/react");
    const session = await getSession();

    if (session?.error === "RefreshAccessTokenError" || session?.error === "RefreshTokenMissing") {
        await signOut({callbackUrl: "/login"});
        return null;
    }

    const token = session?.accessToken ?? null;
    if (token) setHrAuthToken(token);
    return token;
}

export async function hrApiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {method = "GET", body, token, headers = {}, _retry = false} = options;
    const correlationId = crypto.randomUUID();
    const bearer = await resolveAuthToken(token);

    const doFetch = (authHeader: string | null) =>
        fetch(`${HR_API_BASE_URL}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                "X-Correlation-ID": correlationId,
                ...(authHeader ? {Authorization: `Bearer ${authHeader}`} : {}),
                ...headers,
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
        const newToken = await refreshSessionTokens();
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
        return handleErrorResponse(response, {...options, _retry: true});
    }

    if (!response.ok) {
        return handleErrorResponse(response, options);
    }

    return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        return undefined as T;
    }
    return (await response.json()) as T;
}

async function handleErrorResponse(
    response: Response,
    options: RequestOptions,
): Promise<never> {
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
