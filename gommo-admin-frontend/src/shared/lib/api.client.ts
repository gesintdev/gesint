import { createHttpClient } from "@/shared/lib/create-http-client";
import { signOutToLogin } from "@/shared/lib/sign-out.client";

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8082";
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
