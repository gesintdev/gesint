import type { JWT } from "next-auth/jwt";
import { doRequest } from "@/shared/lib/api.client";
/** Renova o access token ~60s antes de expirar */
export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;

type TokenResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInSeconds: number;
};

export type AuthTokenError = "RefreshAccessTokenError" | "RefreshTokenMissing";

export function isAccessTokenExpired(token: JWT): boolean {
    const expires = token.accessTokenExpires;
    if (typeof expires !== "number") return true;
    return Date.now() >= expires - ACCESS_TOKEN_REFRESH_BUFFER_MS;
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
    if (!token.refreshToken) {
        return { ...token, error: "RefreshTokenMissing" };
    }
    try {
        const data = await doRequest<TokenResponse>("/api/v1/auth/refresh", {
            method: "POST",
            body: { refreshToken: token.refreshToken },
            skipAuth: true,
            skipAuthRetry: true,
        });
        return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
            error: undefined,
        };
    } catch {
        return { ...token, error: "RefreshAccessTokenError" };
    }
}
