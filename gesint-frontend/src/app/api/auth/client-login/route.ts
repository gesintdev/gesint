import { NextResponse } from "next/server";

import { serverApiPost } from "@/shared/lib/server-api";
import { buildTenantRequestHeaders } from "@/shared/lib/tenant";

type LoginBody = {
    username?: string;
    password?: string;
    tenantSlug?: string;
};

/**
 * Proxy same-origin do login Client.
 * O browser fala só com o host do tenant (ex.: teste.gesint.local);
 * o server chama as bases internas via `serverApiPost` e envia X-Tenant-Slug.
 */
export async function POST(request: Request) {
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

    try {
        const result = await serverApiPost(
            "/api/v1/auth/login",
            { username, password },
            buildTenantRequestHeaders(tenantSlug),
        );
        return new NextResponse(result.text || JSON.stringify({ message: "Usuário ou senha inválidos" }), {
            status: result.status,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("[client-login proxy] falhou:", error instanceof Error ? error.message : error);
        return NextResponse.json({ message: "Falha ao autenticar na API" }, { status: 502 });
    }
}
