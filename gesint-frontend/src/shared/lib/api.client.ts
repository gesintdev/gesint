import {AppException} from "@/shared/exceptions/app.exception";
import type {ErrorResponseDto} from "@/shared/exceptions/error-response.dto";
import {BRANCH_HEADER, buildBranchRequestHeaders, readActiveBranch} from "@/shared/lib/branch";
import {createHttpClient} from "@/shared/lib/create-http-client";
import {signOutToTenantLogin} from "@/shared/lib/sign-out.client";
import {buildTenantRequestHeaders, resolveTenantSlugFromHostname} from "@/shared/lib/tenant";

/**
 * No browser usa a FQDN pública. No server preferir URL interna Docker
 * (`API_INTERNAL_URL`) para evitar DNS/TLS de api.gesint.local no Coolify lab.
 */
function resolveApiBaseUrl(): string {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";
    if (typeof window === "undefined") {
        return process.env.API_INTERNAL_URL?.trim() || publicApiUrl;
    }
    return publicApiUrl;
}

export {ApiError, AppException} from "@/shared/exceptions/app.exception";
export type {DoRequestOptions} from "@/shared/lib/create-http-client";

/**
 * Resolve X-Tenant-Slug a partir do host (fonte da verdade).
 * Em localhost sem subdomínio não reaproveita session.tenantSlug — cookies Auth.js
 * ficam em AUTH_URL (localhost) e vazariam o tenant de posto-sjb.localhost.
 */
export async function resolveClientTenantHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
    // Ao contrario do tenant, a filial nao pode vir do host: ela e a escolha do seletor.
    const branchHeaders = extra?.[BRANCH_HEADER]?.trim()
        ? {}
        : buildBranchRequestHeaders(typeof window !== "undefined" ? readActiveBranch() : null);

    const fromExtra = extra?.["X-Tenant-Slug"]?.trim();
    if (fromExtra) {
        return {
            ...buildTenantRequestHeaders(fromExtra),
            ...branchHeaders,
            ...extra,
        };
    }

    const fromHost = typeof window !== "undefined" ? resolveTenantSlugFromHostname() : null;
    if (fromHost) {
        return {
            ...buildTenantRequestHeaders(fromHost),
            ...branchHeaders,
            ...extra,
        };
    }

    return {...branchHeaders, ...(extra ?? {})};
}

const httpClient = createHttpClient({
    getBaseUrl: resolveApiBaseUrl,
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

/** POST com corpo JSON que devolve um fluxo de eventos, sem parsear o corpo. */
export async function apiFetchStream(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    const bearer = await resolveAuthToken();
    const headers = await resolveClientTenantHeaders({
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        "X-Correlation-ID": crypto.randomUUID(),
        ...(bearer ? {Authorization: `Bearer ${bearer}`} : {}),
    });
    const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
        signal,
    });
    if (!response.ok) {
        throw AppException.fromApiResponse(await readErrorPayload(response), response.status);
    }
    return response;
}

async function readErrorPayload(response: Response): Promise<ErrorResponseDto> {
    const fallback: ErrorResponseDto = {code: "UNKNOWN", message: response.statusText};
    try {
        const body = (await response.json()) as Partial<ErrorResponseDto>;
        return {
            code: body.code ?? fallback.code,
            message: body.message ?? fallback.message,
            correlationId: body.correlationId,
            timestamp: body.timestamp,
        };
    } catch {
        return fallback;
    }
}

export function apiFetchBlob(
    path: string,
    options: Omit<import("@/shared/lib/create-http-client").DoRequestOptions, "responseType" | "body"> = {},
): Promise<Blob> {
    return doRequest<Blob>(path, {...options, responseType: "blob"});
}
