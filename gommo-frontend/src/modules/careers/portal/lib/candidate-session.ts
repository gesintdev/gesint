/**
 * Sessao do portal do candidato — isolada do NextAuth do ERP (cookies gommo-hr.*).
 * Tokens ficam em sessionStorage do browser; nunca misturar com setAuthToken do HR.
 */

const STORAGE_KEY = "gommo-candidate.session";

export type CandidateSession = {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    fullName: string;
    email: string;
    tenantSlug?: string;
    tenantName?: string;
};

export function readCandidateSession(): CandidateSession | null {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw) as CandidateSession;
        if (!parsed?.accessToken || !parsed?.refreshToken) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function writeCandidateSession(session: CandidateSession): void {
    if (typeof window === "undefined") {
        return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("gommo-candidate-session"));
}

export function clearCandidateSession(): void {
    if (typeof window === "undefined") {
        return;
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("gommo-candidate-session"));
}

export function candidateSessionFromTokenResponse(response: {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
    fullName: string;
    email: string;
    tenantSlug?: string;
    tenantName?: string;
}): CandidateSession {
    return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: Date.now() + Math.max(30, response.expiresInSeconds - 30) * 1000,
        fullName: response.fullName,
        email: response.email,
        tenantSlug: response.tenantSlug,
        tenantName: response.tenantName,
    };
}
