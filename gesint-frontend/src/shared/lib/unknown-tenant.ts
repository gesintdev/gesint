import { NextResponse, type NextRequest } from "next/server";

import { resolveTenantSlugFromHostname } from "@/shared/lib/tenant";

const FOUND_CACHE_MS = 60_000;
const MISSING_CACHE_MS = 15_000;

type CacheEntry = { exists: boolean; expiresAt: number };

const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<boolean | null>>();

function apiBaseUrl(): string {
    return (
        process.env.API_INTERNAL_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        "http://localhost:8081"
    );
}

function requestHostname(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-host");
    const raw = (forwarded?.split(",")[0] ?? request.headers.get("host") ?? "").trim();
    return raw.split(":")[0];
}

function remember(slug: string, exists: boolean): void {
    if (cache.size > 500) {
        cache.clear();
    }
    cache.set(slug, { exists, expiresAt: Date.now() + (exists ? FOUND_CACHE_MS : MISSING_CACHE_MS) });
}

/**
 * null = a API nao respondeu. Nao trata como tenant inexistente para nao derrubar
 * um cliente real quando o backend oscila.
 */
async function probeTenant(slug: string): Promise<boolean | null> {
    const hit = cache.get(slug);
    if (hit && hit.expiresAt > Date.now()) {
        return hit.exists;
    }
    const inflight = pending.get(slug);
    if (inflight) {
        return inflight;
    }
    const task = fetchTenant(slug).finally(() => pending.delete(slug));
    pending.set(slug, task);
    return task;
}

async function fetchTenant(slug: string): Promise<boolean | null> {
    try {
        const response = await fetch(`${apiBaseUrl()}/api/v1/auth/tenant`, {
            headers: { "X-Tenant-Slug": slug, Accept: "application/json" },
            cache: "no-store",
            signal: AbortSignal.timeout(2500),
        });
        if (response.status === 404) {
            remember(slug, false);
            return false;
        }
        if (response.ok || response.status === 403 || response.status === 503) {
            remember(slug, true);
            return true;
        }
        return null;
    } catch {
        return null;
    }
}

/** 404 sem corpo. O navegador mostra a pagina nativa de erro. */
export function emptyNotFound(): NextResponse {
    return new NextResponse(null, {
        status: 404,
        headers: {
            "cache-control": "no-store",
            "content-length": "0",
        },
    });
}

/**
 * Host com slug que nao corresponde a um tenant cadastrado.
 * Apex e localhost sem slug seguem o fluxo normal.
 */
export async function unknownTenantResponse(request: NextRequest): Promise<NextResponse | null> {
    const slug = resolveTenantSlugFromHostname(requestHostname(request));
    if (!slug) {
        return null;
    }
    const exists = await probeTenant(slug);
    if (exists !== false) {
        return null;
    }
    return emptyNotFound();
}
