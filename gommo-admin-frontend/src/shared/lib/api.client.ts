import { AppException } from "@/shared/exceptions/app.exception";
import type { ErrorResponseDto } from "@/shared/exceptions/error-response.dto";
import { AUTH_CLIENT_MESSAGES } from "@/modules/root/exceptions/auth.messages";
import { createHttpClient } from "@/shared/lib/create-http-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:8082";

export { ApiError, AppException } from "@/shared/exceptions/app.exception";

export type { DoRequestOptions } from "@/shared/lib/create-http-client";

const httpClient = createHttpClient({
    baseUrl: API_BASE_URL,
    refreshAccessToken: async (refreshToken) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
/** Ponto unico de saida HTTP do admin frontend (control plane). */
export const doRequest = httpClient.doRequest;
export const apiFetch = httpClient.apiFetch;
export const setAuthToken = httpClient.setAuthToken;
