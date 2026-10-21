import { careersApiBaseUrl, resolveRequestTenantSlug } from "@/modules/careers/site/server/careers-site.server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `<img>` não envia X-Tenant-Slug: este proxy resolve o tenant pelo host e repassa a imagem. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!UUID.test(id)) {
        return new Response(null, { status: 404 });
    }
    const tenantSlug = await resolveRequestTenantSlug();
    const upstream = await fetch(`${careersApiBaseUrl()}/api/v1/public/careers/assets/${id}`, {
        headers: tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {},
        cache: "no-store",
    }).catch(() => null);

    if (!upstream || !upstream.ok || !upstream.body) {
        return new Response(null, { status: 404 });
    }
    return new Response(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
            "Cache-Control": "public, max-age=86400",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
