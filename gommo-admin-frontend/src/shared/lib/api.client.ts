import { createHttpClient } from "@/shared/lib/create-http-client";
import { signOutToLogin } from "@/shared/lib/sign-out.client";

/**
 * No browser usa a FQDN pública. No server preferir URL interna Docker
 * (`ADMIN_API_INTERNAL_URL`) para evitar TLS self-signed do Traefik.
 * Resolve em runtime (getter) — env do Coolify chega só no container.
 */
function resolveApiBaseUrl(): string {
    const publicApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8082";
    if (typeof window === "undefined") {
        return process.env.ADMIN_API_INTERNAL_URL?.trim() || publicApiUrl;
    }
    return publicApiUrl;
}
export { ApiError, AppException } from "@/shared/exceptions/app.exception";
export type { DoRequestOptions } from "@/shared/lib/create-http-client";

const httpClient = createHttpClient({
    getBaseUrl: resolveApiBaseUrl,
    onSessionExpired: () => {
        void signOutToLogin();
    },
});
/** Ponto unico de saida HTTP do admin frontend (control plane). */
export const doRequest = httpClient.doRequest;
export const apiFetch = httpClient.apiFetch;
export const setAuthToken = httpClient.setAuthToken;
