/**
 * Le claims do access token emitido pelo backend.
 *
 * As permissoes ja viajam dentro do proprio access token, que por sua vez e guardado no cookie de
 * sessao. Repetir a lista tambem em texto na sessao dobrava a maior parte do cookie sem acrescentar
 * informacao, e um usuario com o catalogo completo de permissoes chegava a estourar o limite de
 * header do servidor. Aqui a lista e derivada do token em vez de duplicada.
 *
 * O token e apenas decodificado, nunca validado: quem valida assinatura e expiracao e o backend a
 * cada request. Este valor serve so para montar menu e liberar rota no cliente.
 */
export function readPermissionsFromAccessToken(accessToken: unknown): string[] {
    const payload = decodePayload(accessToken);
    if (!payload) {
        return [];
    }
    const permissions = payload.permissions;
    return Array.isArray(permissions) ? permissions.map(String) : [];
}

function decodePayload(accessToken: unknown): Record<string, unknown> | null {
    if (typeof accessToken !== "string") {
        return null;
    }
    const segments = accessToken.split(".");
    if (segments.length !== 3) {
        return null;
    }
    try {
        const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = Buffer.from(base64, "base64").toString("utf8");
        const parsed = JSON.parse(json) as unknown;
        return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
    } catch {
        return null;
    }
}
