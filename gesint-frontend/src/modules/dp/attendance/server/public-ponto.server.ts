import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { resolveTenantSlugFromHostname } from "@/shared/lib/tenant";

function apiBaseUrl(): string {
    return (
        process.env.API_INTERNAL_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8081"
    );
}

async function requestTenantSlug(): Promise<string | null> {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
    return resolveTenantSlugFromHostname(host.split(":")[0]);
}

/**
 * Host com slug que nao corresponde a um tenant cadastrado responde 404.
 * Apex e localhost sem slug seguem o aviso ja existente na pagina.
 */
export async function assertPublicPontoTenant(): Promise<void> {
    const slug = await requestTenantSlug();
    if (!slug) {
        return;
    }

    let response: Response;
    try {
        response = await fetch(`${apiBaseUrl()}/api/v1/public/ponto/context`, {
            headers: { "X-Tenant-Slug": slug },
            cache: "no-store",
        });
    } catch {
        return;
    }

    if (response.status === 404) {
        notFound();
    }
}
