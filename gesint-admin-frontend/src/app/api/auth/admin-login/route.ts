import { NextResponse } from "next/server";

type LoginBody = {
    username?: string;
    password?: string;
};

/**
 * Proxy same-origin do login Admin.
 * O browser só fala com admin.gesint.local (evita cert/CORS da API);
 * o server chama ADMIN_API_INTERNAL_URL (HTTP interno / host LAN).
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
    if (!username || !password) {
        return NextResponse.json({ message: "Usuário e senha obrigatórios" }, { status: 400 });
    }

    const bases = [
        process.env.ADMIN_API_INTERNAL_URL?.trim(),
        process.env.NEXT_PUBLIC_ADMIN_API_URL?.trim(),
    ].filter(Boolean) as string[];

    const errors: string[] = [];
    for (const base of bases) {
        const url = `${base.replace(/\/$/, "")}/api/v1/auth/login`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ username, password }),
                cache: "no-store",
            });
            const text = await response.text();
            if (!response.ok) {
                errors.push(`${url} → HTTP ${response.status}`);
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

    console.error("[admin-login proxy] failed:", errors.join(" | "));
    return NextResponse.json({ message: "Falha ao autenticar na Admin API" }, { status: 502 });
}
