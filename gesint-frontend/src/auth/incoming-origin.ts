import type { NextRequest } from "next/server";

/**
 * O Auth.js (`reqWithEnvURL`) troca a origem da request do proxy por
 * `AUTH_URL` / `NEXTAUTH_URL` antes do redirect. Em produção isso é
 * `https://app.gesint.com.br`, então o primeiro acesso a
 * `https://{tenant}.gesint.com.br` (rota protegida, sem sessão) responde
 * `Location` para o host canônico.
 *
 * `/login` fica fora do proxy, por isso redigitar o endereço já em `/login`
 * permanece no tenant. Aqui o `Location` volta para o host que o browser abriu.
 * Retorna true quando o header muda — o proxy recria a resposta uma vez só.
 */
export function retargetCanonicalRedirect(request: NextRequest, status: number, headers: Headers): boolean {
    if (status < 300 || status >= 400) {
        return false;
    }
    const location = headers.get("location");
    const canonical = canonicalAuthOrigin();
    if (!location || !canonical) {
        return false;
    }

    let target: URL;
    try {
        target = new URL(location);
    } catch {
        return false;
    }
    if (target.origin !== canonical) {
        return false;
    }

    const host = browserHost(request);
    const proto = browserProto(request);
    const incomingOrigin = `${proto}://${host}`;
    if (!isAllowedHost(host) || incomingOrigin === canonical) {
        return false;
    }

    headers.set("location", new URL(`${target.pathname}${target.search}${target.hash}`, incomingOrigin).href);
    return true;
}

function canonicalAuthOrigin(): string | null {
    const raw = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
    if (!raw) {
        return null;
    }
    try {
        return new URL(raw).origin;
    } catch {
        return null;
    }
}

function browserHost(request: NextRequest): string {
    const forwarded = firstHeaderValue(request.headers.get("x-forwarded-host"));
    if (isAllowedHost(forwarded)) {
        return forwarded;
    }
    if (isAllowedHost(request.nextUrl.host)) {
        return request.nextUrl.host;
    }
    const host = firstHeaderValue(request.headers.get("host"));
    if (isAllowedHost(host)) {
        return host;
    }
    return "";
}

function browserProto(request: NextRequest): string {
    const forwarded = firstHeaderValue(request.headers.get("x-forwarded-proto")).replace(/:$/, "");
    if (forwarded === "http" || forwarded === "https") {
        return forwarded;
    }
    const fromUrl = request.nextUrl.protocol.replace(":", "");
    return fromUrl === "http" || fromUrl === "https" ? fromUrl : "https";
}

function firstHeaderValue(value: string | null): string {
    return value?.split(",")[0]?.trim() ?? "";
}

function isAllowedHost(host: string): boolean {
    if (!host || host.length > 253 || !/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) {
        return false;
    }
    const hostname = host.replace(/:\d+$/, "").toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return true;
    }
    return tenantBaseDomains().some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

/** Mesma lista de `resolveTenantBaseDomains` em `shared/lib/tenant.ts`. */
function tenantBaseDomains(): string[] {
    const configured = [
        process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN,
        process.env.NEXT_PUBLIC_TENANT_PRODUCTION_BASE_DOMAIN,
        "gesint.local",
        "gesint.com.br",
        "localhost",
    ]
        .map((value) => value?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value));
    return [...new Set(configured)];
}
