import { createHttpClient } from "@/shared/lib/create-http-client";
import { signOutToTenantLogin } from "@/shared/lib/sign-out.client";
import { buildTenantRequestHeaders, resolveTenantSlugFromHostname } from "@/shared/lib/tenant";

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
});
/**
 * Ponto unico de saida HTTP do HR frontend.
 * Sempre injeta Authorization, X-Correlation-ID e X-Tenant-Slug (quando aplicavel).
 */
export const doRequest = httpClient.doRequest;
export const apiFetch = httpClient.apiFetch;
export const setAuthToken = httpClient.setAuthToken;
export const resolveAuthToken = httpClient.resolveAuthToken;

export function apiFetchBlob(
    path: string,
    options: Omit<import("@/shared/lib/create-http-client").DoRequestOptions, "responseType" | "body"> = {},
): Promise<Blob> {
    return doRequest<Blob>(path, { ...options, responseType: "blob" });
}
