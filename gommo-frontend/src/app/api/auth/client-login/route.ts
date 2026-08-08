import { NextResponse } from "next/server";

import { buildTenantRequestHeaders } from "@/shared/lib/tenant";

type LoginBody = {
    username?: string;
    password?: string;
    tenantSlug?: string;
};

/**
 * Proxy same-origin do login Client.
 * O browser fala só com o host do tenant (ex.: teste.gommo.local);
 * o server chama API_INTERNAL_URL (HTTP interno Docker) e envia X-Tenant-Slug.
 */
export async function POST(request: Request) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    let body: LoginBody;
    try {
        body = (await request.json()) as LoginBody;
    } catch {
        return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
    }
    const username = body.username?.trim();
    const password = body.password;
    const tenantSlug = body.tenantSlug?.trim() || undefined;
    if (!username || !password) {
        return NextResponse.json({ message: "Usuário e senha obrigatórios" }, { status: 400 });
    }

    const bases = [
        process.env.API_INTERNAL_URL?.trim(),
        // Fallback Docker UUID do gommo-backend no lab Coolify (mesmo host da rede).
        process.env.GOMMO_BACKEND_INTERNAL_URL?.trim(),
        process.env.NEXT_PUBLIC_API_URL?.trim(),
    ].filter(Boolean) as string[];

    const errors: string[] = [];
    for (const base of bases) {
        const url = `${base.replace(/\/$/, "")}/api/v1/auth/login`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...buildTenantRequestHeaders(tenantSlug),
                },
                body: JSON.stringify({ username, password }),
                cache: "no-store",
            });
            const text = await response.text();
            if (!response.ok) {
                errors.push(`${url} → HTTP ${response.status}`);
                // Credenciais inválidas: propaga o status da API (não tenta outra base).
                if (response.status === 401 || response.status === 403) {
                    return new NextResponse(text || JSON.stringify({ message: "Usuário ou senha inválidos" }), {
                        status: response.status,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                continue;
            }
            return new NextResponse(text, {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            errors.push(`${url} → ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    console.error("[client-login proxy] failed:", errors.join(" | "));
    return NextResponse.json({ message: "Falha ao autenticar na API" }, { status: 502 });
}
