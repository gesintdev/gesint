import { NextResponse } from "next/server";

/**
 * Diagnóstico lab Coolify: testa alcance server-side da Admin API.
 * Remover quando o ambiente de produção estiver estável.
 */
export async function GET() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const bases = [
        process.env.ADMIN_API_INTERNAL_URL?.trim(),
        process.env.NEXT_PUBLIC_ADMIN_API_URL?.trim(),
    ].filter(Boolean) as string[];

    const results = [];
    for (const base of bases) {
        const url = `${base.replace(/\/$/, "")}/actuator/health`;
        const started = Date.now();
        try {
            const response = await fetch(url, { cache: "no-store" });
            const body = await response.text();
            results.push({
                url,
                ok: response.ok,
                status: response.status,
                ms: Date.now() - started,
                body: body.slice(0, 200),
            });
        } catch (error) {
            results.push({
                url,
                ok: false,
                ms: Date.now() - started,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    return NextResponse.json({
        nodeTlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
        results,
    });
}
