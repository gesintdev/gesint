const LOCALHOST_SUFFIX = ".localhost";
/** Prefixo de host que nunca é slug de tenant (API/Admin/apex utilitários). */
const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "ponto"]);

/**
 * Domínios base onde `{slug}.{domain}` identifica o tenant.
 * Espelha `GESINT_TENANT_BASE_DOMAIN` / `GESINT_TENANT_PRODUCTION_BASE_DOMAIN` do backend.
 */
function resolveTenantBaseDomains(): string[] {
    const configured = [
        process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN,
        process.env.NEXT_PUBLIC_TENANT_PRODUCTION_BASE_DOMAIN,
        "gesint.local",
        "gesint.com.br",
    ]
        .map((value) => value?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value));
    return [...new Set(configured)];
}

function singleLabelPrefix(host: string, suffix: string): string | null {
    const prefix = host.slice(0, -suffix.length);
    if (!prefix || prefix.includes(".") || RESERVED_SUBDOMAINS.has(prefix)) {
        return null;
    }
    return prefix;
}

/**
 * Extrai o slug do tenant a partir do hostname do browser.
 * Exemplos: `posto-sjb.localhost` → `posto-sjb`; `teste.gesint.local` → `teste`.
 * Apex (`gesint.local`) e hosts de API (`api.gesint.local`) retornam null.
 */
export function resolveTenantSlugFromHostname(hostname?: string): string | null {
    const host = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).trim().toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1") {
        return null;
    }

    if (host.endsWith(LOCALHOST_SUFFIX)) {
        return singleLabelPrefix(host, LOCALHOST_SUFFIX);
    }

    for (const baseDomain of resolveTenantBaseDomains()) {
        if (host === baseDomain) {
            return null;
        }
        const suffix = `.${baseDomain}`;
        if (host.endsWith(suffix)) {
            return singleLabelPrefix(host, suffix);
        }
    }
    return null;
}

/** Capitaliza cada palavra como nome próprio (ex.: `FLAVIO HENRIQUE` → `Flavio Henrique`). */
function toProperName(value: string): string {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

/** Formata slug de tenant para exibição (ex.: `acme-corp` → `Acme Corp`). */
export function formatTenantDisplayName(slug?: string | null): string | null {
    const value = slug?.trim();
    if (!value) {
        return null;
    }
    return toProperName(value.split(/[-_]+/).filter(Boolean).join(" "));
}

export function resolveClientDisplayName(options?: {
    tenantName?: string | null;
    tenantSlug?: string | null;
}): string | null {
    const fromBackend = options?.tenantName?.trim();
    if (fromBackend) {
        return toProperName(fromBackend);
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
