/**
 * Rotas públicas do Client (sem login). Espelha o `authorized` em auth.ts e o
 * negative lookahead do matcher em proxy.ts — careers e ponto.
 */
export function isPublicAppPath(pathname: string | null | undefined): boolean {
    if (!pathname) {
        return false;
    }
    return pathname.startsWith("/careers") || pathname.startsWith("/ponto");
}
