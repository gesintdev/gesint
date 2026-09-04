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

/**
 * Mapa sistema do perfil -> authorities (`DP` / `RH` / `CONTABILIDADE` / `CFG`).
 * Ausente em tokens antigos: o consumidor deve cair no flat `permissions`.
 */
export function readSystemPermissionsFromAccessToken(
    accessToken: unknown,
): Record<string, string[]> | null {
    const payload = decodePayload(accessToken);
    if (!payload) {
        return null;
    }
    const raw = payload.systemPermissions;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return null;
    }
    const result: Record<string, string[]> = {};
    for (const [system, value] of Object.entries(raw as Record<string, unknown>)) {
        if (!Array.isArray(value)) {
            continue;
        }
        result[system] = value.map(String);
    }
    return Object.keys(result).length > 0 ? result : null;
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
