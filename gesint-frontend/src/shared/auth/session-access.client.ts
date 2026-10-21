import type { Session } from "next-auth";

import { ACCESS_TOKEN_REFRESH_BUFFER_MS } from "@/auth/token-timing";

/** Decodifica `exp` do JWT (ms). Apenas leitura client-side — validação fica no backend. */
export function decodeAccessTokenExpMs(accessToken: unknown): number | null {
    if (typeof accessToken !== "string") {
        return null;
    }
    const parts = accessToken.split(".");
    if (parts.length !== 3) {
        return null;
    }
    try {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const payload = JSON.parse(atob(padded)) as { exp?: unknown };
        return typeof payload.exp === "number" ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

export function readAccessTokenExpiresMs(session: Session | null | undefined): number | null {
    if (typeof session?.accessTokenExpires === "number") {
        return session.accessTokenExpires;
    }
    return decodeAccessTokenExpMs(session?.accessToken);
}

export function isAccessTokenHardExpired(session: Session | null | undefined): boolean {
    const expires = readAccessTokenExpiresMs(session);
    if (expires == null) {
        return false;
    }
    return Date.now() >= expires;
}

export function isSessionTerminal(session: Session | null | undefined): boolean {
    if (!session) {
        return true;
    }
    return session.error === "RefreshAccessTokenError" || session.error === "RefreshTokenMissing";
}

export function isSessionUsable(session: Session | null | undefined): boolean {
    if (isSessionTerminal(session)) {
        return false;
    }
    return Boolean(session?.accessToken);
}

/** Sessão morta no client: token expirado e sem refresh para recuperar. */
export function isSessionLocallyExpired(session: Session | null | undefined): boolean {
    if (!session?.accessToken || session.refreshToken) {
        return false;
    }
    return isAccessTokenHardExpired(session);
}

export function msUntilProactiveRefresh(session: Session | null | undefined): number | null {
    const expires = readAccessTokenExpiresMs(session);
    if (expires == null) {
        return null;
    }
    return Math.max(0, expires - ACCESS_TOKEN_REFRESH_BUFFER_MS - Date.now());
}
