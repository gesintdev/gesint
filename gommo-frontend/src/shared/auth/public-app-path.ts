/**
 * Rotas públicas do Client (sem login). Espelha o `authorized` em auth.ts e o
 * negative lookahead do matcher em proxy.ts — careers e ponto.
 */
export function isPublicAppPath(pathname: string | null | undefined): boolean {
    if (!pathname) {
        return false;
    }
    return pathname.startsWith("/careers") || isPublicPontoPath(pathname);
}

/** Landing pública de ponto — sempre light (`data-theme="gommo"`), independente da preferência. */
export function isPublicPontoPath(pathname: string | null | undefined): boolean {
    if (!pathname) {
        return false;
    }
    return pathname === "/ponto" || pathname.startsWith("/ponto/");
}
