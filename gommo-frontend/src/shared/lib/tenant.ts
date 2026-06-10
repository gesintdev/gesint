const LOCALHOST_SUFFIX = ".localhost";

export function resolveTenantSlugFromHostname(hostname?: string): string | null {
    const host = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).trim().toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1") {
        return null;
    }

    if (host.endsWith(LOCALHOST_SUFFIX)) {
        const slug = host.slice(0, -LOCALHOST_SUFFIX.length);
        if (!slug || slug.includes(".")) {
            return null;
        }
        return slug;
    }
    return null;
}

export function buildTenantRequestHeaders(tenantSlug?: string | null): Record<string, string> {
    const slug = tenantSlug?.trim();
    if (!slug) {
        return {};
    }
    return { "X-Tenant-Slug": slug };
}

export function resolveLoginCallbackUrl(pathname = "/login"): string {
    if (typeof window === "undefined") {
        return pathname;
    }
    return new URL(pathname, window.location.origin).href;
}
