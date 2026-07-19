import type { JWT } from "next-auth/jwt";

import { doRequest } from "@/shared/lib/api.client";

/** Renova o access token ~60s antes de expirar */
export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;
const REFRESH_FAILURE_RETRY_DELAY_MS = 15_000;

type TokenResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInSeconds: number;
};

export type AuthTokenError = "RefreshAccessTokenError" | "RefreshTokenMissing";

const refreshRequests = new Map<string, Promise<JWT>>();

export function isAccessTokenExpired(token: JWT): boolean {
    const expires = token.accessTokenExpires;
    if (typeof expires !== "number") return true;
    const retryAfter = token.refreshRetryAfter;
    if (typeof retryAfter === "number" && Date.now() < retryAfter) return false;
    return Date.now() >= expires - ACCESS_TOKEN_REFRESH_BUFFER_MS;
}

function isAccessTokenHardExpired(token: JWT): boolean {
    const expires = token.accessTokenExpires;
    return typeof expires !== "number" || Date.now() >= expires;
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
    const refreshToken = token.refreshToken as string | undefined;
    if (!refreshToken) {
        return { ...token, error: "RefreshTokenMissing" };
    }

    const pending = refreshRequests.get(refreshToken);
    if (pending) {
        return pending;
    }

    const request = refreshAccessTokenOnce(token, refreshToken);
    refreshRequests.set(refreshToken, request);
    try {
        return await request;
    } finally {
        refreshRequests.delete(refreshToken);
    }
}

async function refreshAccessTokenOnce(token: JWT, refreshToken: string): Promise<JWT> {
    try {
        const data = await doRequest<TokenResponse>("/api/v1/auth/refresh", {
            method: "POST",
            body: { refreshToken },
            skipAuth: true,
            skipAuthRetry: true,
        });
        return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
            refreshRetryAfter: undefined,
            error: undefined,
        };
    } catch (error) {
        const code =
            typeof error === "object" && error !== null && "code" in error
                ? String((error as { code?: unknown }).code)
                : "UNKNOWN";
        console.warn(`Falha ao renovar access token (${code}).`);
        if (!isAccessTokenHardExpired(token)) {
            return {
                ...token,
                refreshRetryAfter: Date.now() + REFRESH_FAILURE_RETRY_DELAY_MS,
                error: undefined,
            };
        }
        return { ...token, error: "RefreshAccessTokenError" };
    }
}
