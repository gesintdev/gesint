import { AppException } from "@/shared/exceptions/app.exception";
import type { ErrorResponseDto } from "@/shared/exceptions/error-response.dto";
import { AUTH_CLIENT_MESSAGES } from "@/modules/root/exceptions/auth.messages";
import { signOutToTenantLogin } from "@/shared/lib/sign-out.client";
import { buildTenantRequestHeaders, resolveTenantSlugFromHostname } from "@/shared/lib/tenant";
import { createHttpClient } from "@/shared/lib/create-http-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export { ApiError, AppException } from "@/shared/exceptions/app.exception";

export type { DoRequestOptions } from "@/shared/lib/create-http-client";

export async function resolveClientTenantHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
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
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        if (session?.tenantSlug) {
            return {
                ...buildTenantRequestHeaders(session.tenantSlug),
                ...extra,
            };
        }
    }
    return { ...(extra ?? {}) };
}

const httpClient = createHttpClient({
    baseUrl: API_BASE_URL,
    resolveExtraHeaders: resolveClientTenantHeaders,
    onSessionExpired: () => signOutToTenantLogin(),
    refreshAccessToken: async (refreshToken) => {
        const tenantSlug =
            typeof window !== "undefined"
                ? (resolveTenantSlugFromHostname() ??
                  (await import("next-auth/react").then((m) => m.getSession()))?.tenantSlug)
                : undefined;
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...buildTenantRequestHeaders(tenantSlug),
                },
                body: JSON.stringify({ refreshToken }),
                cache: "no-store",
            });
            if (!response.ok) return null;
            const data = (await response.json()) as { accessToken?: string };
            return data.accessToken ?? null;
        } catch {
            return null;
        }
    },
});
/**
 * Ponto unico de saida HTTP do HR frontend.
 * Sempre injeta Authorization, X-Correlation-ID e X-Tenant-Slug (quando aplicavel).
 */
export const doRequest = httpClient.doRequest;
export const apiFetch = httpClient.apiFetch;
export const setAuthToken = httpClient.setAuthToken;
export const resolveAuthToken = httpClient.resolveAuthToken;
