import { headers } from "next/headers";
import { cache } from "react";

import type { CareersSite, CareersVacancy } from "@/modules/careers/shared/dto/careers.dto";
import { resolveTenantSlugFromHostname } from "@/shared/lib/tenant";

/** Leitura no servidor (SEO/metadata). O tenant vem do host da requisição, como no browser. */
export function careersApiBaseUrl(): string {
    return (
        process.env.API_INTERNAL_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8081"
    );
}

export async function resolveRequestTenantSlug(): Promise<string | null> {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
    return resolveTenantSlugFromHostname(host.split(":")[0]);
}

export async function resolveRequestOrigin(): Promise<string | null> {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    if (!host) return null;
    const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    return `${protocol}://${host}`;
}

async function fetchPublic<T>(path: string): Promise<T | null> {
    try {
        const tenantSlug = await resolveRequestTenantSlug();
        const response = await fetch(`${careersApiBaseUrl()}${path}`, {
            headers: tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {},
            cache: "no-store",
        });
        if (!response.ok) return null;
        return (await response.json()) as T;
    } catch {
        return null;
    }
}

/** `cache`: generateMetadata e a página compartilham a mesma leitura por requisição. */
export const fetchCareersSite = cache(
    (): Promise<CareersSite | null> => fetchPublic<CareersSite>("/api/v1/public/careers"),
);

export const fetchCareersVacancy = cache(
    (slug: string): Promise<CareersVacancy | null> =>
        fetchPublic<CareersVacancy>(`/api/v1/public/careers/${encodeURIComponent(slug)}`),
);
