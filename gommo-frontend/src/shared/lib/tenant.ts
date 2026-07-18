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

/** Formata slug de tenant para exibição (ex.: `acme-corp` → `Acme Corp`). */
export function formatTenantDisplayName(slug?: string | null): string | null {
    const value = slug?.trim();
    if (!value) {
        return null;
    }
    return value
        .split(/[-_]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

export function resolveClientDisplayName(options?: {
    tenantName?: string | null;
    tenantSlug?: string | null;
}): string | null {
    const fromBackend = options?.tenantName?.trim();
    if (fromBackend) {
        return fromBackend;
    }
    return formatTenantDisplayName(options?.tenantSlug ?? resolveTenantSlugFromHostname());
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
