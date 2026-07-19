import type { JWT } from "next-auth/jwt";

import { doRequest } from "@/shared/lib/api.client";
import { buildTenantRequestHeaders } from "@/shared/lib/tenant";

/** Renova o access token ~60s antes de expirar */
export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;
export const REFRESH_TOKEN_ROTATION_INTERVAL_MS = 15 * 60_000;
const REFRESH_FAILURE_RETRY_DELAY_MS = 15_000;

type TokenResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInSeconds: number;
    collaboratorId?: string;
    photoObjectId?: string;
    jobPositionId?: string;
    jobPositionName?: string;
    departmentId?: string;
    departmentName?: string;
    permissions?: string[];
    tenantSlug?: string;
    tenantName?: string;
    contractedSystemKeys?: string[] | null;
};

export type AuthTokenError = "RefreshAccessTokenError" | "RefreshTokenMissing";

const refreshRequests = new Map<string, Promise<JWT>>();

export function isAccessTokenExpired(token: JWT): boolean {
    const expires = token.accessTokenExpires;
    if (typeof expires !== "number") return true;
    const retryAfter = token.refreshRetryAfter;
    if (typeof retryAfter === "number" && Date.now() < retryAfter) return false;
    if (isRefreshTokenRotationDue(token)) return true;
    return Date.now() >= expires - ACCESS_TOKEN_REFRESH_BUFFER_MS;
}

function isRefreshTokenRotationDue(token: JWT): boolean {
    const issuedAt = token.refreshTokenIssuedAt;
    return typeof issuedAt === "number" && Date.now() >= issuedAt + REFRESH_TOKEN_ROTATION_INTERVAL_MS;
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
            skipAuthRetry: true,
            skipAuth: true,
            headers: buildTenantRequestHeaders(token.tenantSlug as string | undefined),
        });
        const refreshTokenChanged = data.refreshToken !== refreshToken;
        return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            refreshTokenIssuedAt: refreshTokenChanged ? Date.now() : (token.refreshTokenIssuedAt ?? Date.now()),
            accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
            collaboratorId: data.collaboratorId,
            photoObjectId: data.photoObjectId,
            jobPositionId: data.jobPositionId,
            jobPositionName: data.jobPositionName,
            departmentId: data.departmentId,
            departmentName: data.departmentName,
            permissions: data.permissions ?? (token.permissions as string[] | undefined) ?? [],
            tenantSlug: data.tenantSlug ?? (token.tenantSlug as string | undefined),
            tenantName: data.tenantName ?? (token.tenantName as string | undefined),
            contractedSystemKeys:
                data.contractedSystemKeys !== undefined
                    ? data.contractedSystemKeys
                    : ((token.contractedSystemKeys as string[] | null | undefined) ?? null),
            refreshRetryAfter: undefined,
            error: undefined,
        };
    } catch (error) {
        const code =
            typeof error === "object" && error !== null && "code" in error
                ? String((error as { code?: unknown }).code)
                : "UNKNOWN";
        console.warn(`Falha ao renovar access token (${code}).`);
        // Revogação / refresh inválido: encerra a sessão mesmo com access ainda válido.
        if (isHardRefreshFailure(code) || isAccessTokenHardExpired(token)) {
            return { ...token, error: "RefreshAccessTokenError" };
        }
        return {
            ...token,
            refreshRetryAfter: Date.now() + REFRESH_FAILURE_RETRY_DELAY_MS,
            error: undefined,
        };
    }
}

function isHardRefreshFailure(code: string): boolean {
    return (
        code === "AUTH_REVOKED_REFRESH" ||
        code === "AUTH_INVALID_REFRESH" ||
        code === "AUTH_EXPIRED_REFRESH" ||
        code === "AUTH_SESSION_EXPIRED"
    );
}
