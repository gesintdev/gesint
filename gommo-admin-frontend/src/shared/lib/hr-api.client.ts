import { createHttpClient } from "@/shared/lib/create-http-client";

const HR_API_BASE_URL = process.env.NEXT_PUBLIC_HR_API_URL ?? "http://localhost:8081";

export { ApiError, AppException } from "@/shared/exceptions/app.exception";
export type { DoRequestOptions } from "@/shared/lib/create-http-client";

const httpClient = createHttpClient({
    baseUrl: HR_API_BASE_URL,
});
/** Chamadas ao gommo-backend (HR) a partir do painel admin. */
export const hrDoRequest = httpClient.doRequest;
export const hrApiFetch = httpClient.apiFetch;
export const setHrAuthToken = httpClient.setAuthToken;
