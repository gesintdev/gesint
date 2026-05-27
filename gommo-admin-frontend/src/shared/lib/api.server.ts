import {apiFetch} from "@/shared/lib/api.client";

/** Fetch autenticado em Server Components / Server Actions. */
export function serverApiFetch<T>(path: string, accessToken: string | undefined, init?: {
    method?: string;
    body?: unknown
}) {
    return apiFetch<T>(path, {
        method: init?.method,
        body: init?.body,
        token: accessToken ?? null,
    });
}
