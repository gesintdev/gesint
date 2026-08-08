import { createHttpClient } from "@/shared/lib/create-http-client";
import { signOutToLogin } from "@/shared/lib/sign-out.client";

/**
 * No browser usa a FQDN pública. No server (Auth.js authorize) preferir URL
 * interna Docker (`ADMIN_API_INTERNAL_URL`) para evitar TLS self-signed do Traefik.
 */
const publicApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8082";
const API_BASE_URL =
    typeof window === "undefined"
        ? process.env.ADMIN_API_INTERNAL_URL?.trim() || publicApiUrl
        : publicApiUrl;
export { ApiError, AppException } from "@/shared/exceptions/app.exception";
export type { DoRequestOptions } from "@/shared/lib/create-http-client";

const httpClient = createHttpClient({
    baseUrl: API_BASE_URL,
    onSessionExpired: () => {
        void signOutToLogin();
    },
});
/** Ponto unico de saida HTTP do admin frontend (control plane). */
export const doRequest = httpClient.doRequest;
export const apiFetch = httpClient.apiFetch;
export const setAuthToken = httpClient.setAuthToken;
