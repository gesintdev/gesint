import type { JWT } from "next-auth/jwt";

import { canPersistSessionCookie } from "@/auth/session-write-context";
import { ACCESS_TOKEN_REFRESH_BUFFER_MS } from "@/auth/token-timing";
import { isSessionDeadCode } from "@/shared/auth/session-dead-codes";
import { AppException } from "@/shared/exceptions/app.exception";
import { serverApiPost, toErrorPayload } from "@/shared/lib/server-api";
import { buildTenantRequestHeaders } from "@/shared/lib/tenant";

export { ACCESS_TOKEN_REFRESH_BUFFER_MS } from "@/auth/token-timing";
export const REFRESH_TOKEN_ROTATION_INTERVAL_MS = 15 * 60_000;
const REFRESH_FAILURE_RETRY_DELAY_MS = 5_000;
/** Falhas transitórias consecutivas toleradas antes de encerrar a sessão. */
const MAX_TRANSIENT_REFRESH_FAILURES = 6;

type TokenResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInSeconds: number;
    name?: string;
    username?: string;
    collaboratorId?: string;
    photoObjectId?: string;
    tenantSlug?: string;
    tenantName?: string;
    platformAdmin?: boolean;
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

export async function refreshAccessToken(token: JWT): Promise<JWT> {
    const refreshToken = token.refreshToken as string | undefined;
    if (!refreshToken) {
        return { ...token, error: "RefreshTokenMissing" };
    }

    // Render RSC / prefetch: o Set-Cookie seria descartado pelo next-auth. Rotacionar aqui
    // revogaria o refresh token no backend sem entregar o substituto ao browser.
    if (!canPersistSessionCookie()) {
        return token;
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
        const result = await serverApiPost(
            "/api/v1/auth/refresh",
            { refreshToken },
            buildTenantRequestHeaders(token.tenantSlug as string | undefined),
        );
        if (!result.ok) {
            const payload = toErrorPayload(result);
            throw payload
                ? AppException.fromApiResponse(payload, result.status)
                : new Error(`${result.baseUrl} → HTTP ${result.status}: ${result.text.slice(0, 200)}`);
        }
        const data = result.json as TokenResponse;
        const refreshTokenChanged = data.refreshToken !== refreshToken;
        const username = data.username ?? (token.username as string | undefined);
        const displayName = data.name?.trim() || username || (token.name as string | undefined);
        return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            refreshTokenIssuedAt: refreshTokenChanged ? Date.now() : (token.refreshTokenIssuedAt ?? Date.now()),
            accessTokenExpires: Date.now() + data.expiresInSeconds * 1000,
            name: displayName,
            username,
            collaboratorId: data.collaboratorId,
            photoObjectId: data.photoObjectId,
            tenantSlug: data.tenantSlug ?? (token.tenantSlug as string | undefined),
            tenantName: data.tenantName ?? (token.tenantName as string | undefined),
            platformAdmin:
                data.platformAdmin !== undefined
                    ? data.platformAdmin
                    : ((token.platformAdmin as boolean | undefined) ?? false),
            refreshRetryAfter: undefined,
            refreshFailureCount: undefined,
            error: undefined,
        };
    } catch (error) {
        const code =
            typeof error === "object" && error !== null && "code" in error
                ? String((error as { code?: unknown }).code)
                : "UNKNOWN";
        const failureCount = (token.refreshFailureCount ?? 0) + 1;
        const reason = error instanceof Error ? error.message : String(error);
        console.warn(`[auth] falha ao renovar access token (${code}), tentativa ${failureCount}: ${reason}`);
        if (isSessionDeadCode(code)) {
            return { ...token, error: "RefreshAccessTokenError" };
        }
        if (failureCount >= MAX_TRANSIENT_REFRESH_FAILURES) {
            return { ...token, error: "RefreshAccessTokenError" };
        }
        return {
            ...token,
            refreshRetryAfter: Date.now() + REFRESH_FAILURE_RETRY_DELAY_MS,
            refreshFailureCount: failureCount,
            error: undefined,
        };
    }
}
