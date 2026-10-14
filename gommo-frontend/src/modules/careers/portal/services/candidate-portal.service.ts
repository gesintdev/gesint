import type {
    CandidatePortalApplication,
    CandidatePortalLoginPayload,
    CandidatePortalMe,
    CandidatePortalProviders,
    CandidatePortalRegisterPayload,
    CandidatePortalTokenResponse,
} from "@/modules/careers/portal/dto/candidate-portal.dto";
import {
    candidateSessionFromTokenResponse,
    clearCandidateSession,
    readCandidateSession,
    writeCandidateSession,
} from "@/modules/careers/portal/lib/candidate-session";
import { apiFetch } from "@/shared/lib/api.client";

const AUTH_BASE = "/api/v1/public/candidate/auth";
const PORTAL_BASE = "/api/v1/candidate-portal";

async function withCandidateToken<T>(path: string, init: RequestInit & { method?: string; body?: unknown } = {}): Promise<T> {
    const session = await ensureFreshSession();
    if (!session) {
        throw new Error("CANDIDATE_PORTAL_UNAUTHORIZED");
    }
    try {
        return await apiFetch<T>(path, {
            method: init.method,
            body: init.body,
            token: session.accessToken,
            skipAuth: false,
            skipAuthRetry: true,
        });
    } catch (error) {
        const status = (error as { status?: number })?.status;
        if (status === 401) {
            clearCandidateSession();
        }
        throw error;
    }
}

async function ensureFreshSession() {
    const session = readCandidateSession();
    if (!session) {
        return null;
    }
    if (session.expiresAt > Date.now() + 15_000) {
        return session;
    }
    try {
        const refreshed = await apiFetch<CandidatePortalTokenResponse>(`${AUTH_BASE}/refresh`, {
            method: "POST",
            body: { refreshToken: session.refreshToken },
            skipAuth: true,
            skipAuthRetry: true,
        });
        const next = candidateSessionFromTokenResponse(refreshed);
        writeCandidateSession(next);
        return next;
    } catch {
        clearCandidateSession();
        return null;
    }
}

function persistTokens(response: CandidatePortalTokenResponse) {
    writeCandidateSession(candidateSessionFromTokenResponse(response));
    return response;
}

class CandidatePortalService {
    getProviders(): Promise<CandidatePortalProviders> {
        return apiFetch<CandidatePortalProviders>(`${AUTH_BASE}/providers`, { skipAuth: true });
    }

    async register(payload: CandidatePortalRegisterPayload): Promise<CandidatePortalTokenResponse> {
        const response = await apiFetch<CandidatePortalTokenResponse>(`${AUTH_BASE}/register`, {
            method: "POST",
            body: payload,
            skipAuth: true,
            skipAuthRetry: true,
        });
        return persistTokens(response);
    }

    async login(payload: CandidatePortalLoginPayload): Promise<CandidatePortalTokenResponse> {
        const response = await apiFetch<CandidatePortalTokenResponse>(`${AUTH_BASE}/login`, {
            method: "POST",
            body: payload,
            skipAuth: true,
            skipAuthRetry: true,
        });
        return persistTokens(response);
    }

    async loginWithGoogle(idToken: string): Promise<CandidatePortalTokenResponse> {
        const response = await apiFetch<CandidatePortalTokenResponse>(`${AUTH_BASE}/google`, {
            method: "POST",
            body: { idToken },
            skipAuth: true,
            skipAuthRetry: true,
        });
        return persistTokens(response);
    }

    logout(): void {
        clearCandidateSession();
    }

    me(): Promise<CandidatePortalMe> {
        return withCandidateToken<CandidatePortalMe>(`${PORTAL_BASE}/me`);
    }

    updateProfile(payload: { fullName?: string; phone?: string }): Promise<CandidatePortalMe> {
        return withCandidateToken<CandidatePortalMe>(`${PORTAL_BASE}/me`, {
            method: "PUT",
            body: payload,
        });
    }

    updateConsents(payload: { talentPoolConsent?: boolean }): Promise<CandidatePortalMe> {
        return withCandidateToken<CandidatePortalMe>(`${PORTAL_BASE}/me/consents`, {
            method: "PUT",
            body: payload,
        });
    }

    listApplications(): Promise<CandidatePortalApplication[]> {
        return withCandidateToken<CandidatePortalApplication[]>(`${PORTAL_BASE}/applications`);
    }

    getApplicationByVacancySlug(slug: string): Promise<CandidatePortalApplication> {
        return withCandidateToken<CandidatePortalApplication>(
            `${PORTAL_BASE}/applications/by-vacancy/${encodeURIComponent(slug)}`,
        );
    }

    withdraw(applicationId: string): Promise<CandidatePortalApplication> {
        return withCandidateToken<CandidatePortalApplication>(
            `${PORTAL_BASE}/applications/${encodeURIComponent(applicationId)}/withdraw`,
            { method: "POST" },
        );
    }
}

export const candidatePortalService = new CandidatePortalService();

export const candidatePortalKeys = {
    me: ["candidate-portal", "me"] as const,
    applications: ["candidate-portal", "applications"] as const,
    byVacancy: (slug: string) => ["candidate-portal", "applications", "vacancy", slug] as const,
    providers: ["candidate-portal", "providers"] as const,
};
