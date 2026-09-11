import type { NextFetchEvent, NextRequest } from "next/server";
import type { NextAuthRequest } from "next-auth";

import { auth } from "@/auth";
import { HR_SESSION_COOKIE_NAME } from "@/auth/cookies";

/**
 * O Auth.js reescreve o cookie de sessão em toda resposta, inclusive aqui. Como o Proxy roda
 * em cada navegação e em cada prefetch de `<Link>`, uma requisição que começou antes de uma
 * rotação terminava depois dela e regravava o token ANTIGO (já revogado) por cima do novo —
 * a sessão caía poucos minutos depois, só em produção, onde o prefetch existe.
 *
 * Aqui só interessa autorizar a rota. A escrita do cookie fica exclusivamente com
 * `/api/auth/*`, que é serializado pelo próprio cliente. Remoções (logout / token corrompido)
 * continuam passando.
 */
const authorizeRequest = auth((_request: NextAuthRequest, _event: NextFetchEvent) => undefined);

export async function proxy(request: NextRequest, event: NextFetchEvent) {
    const response = await authorizeRequest(request, event);
    return response instanceof Response ? dropSessionCookieWrites(response) : response;
}

function dropSessionCookieWrites(response: Response): Response {
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length === 0) {
        return response;
    }
    const kept = setCookies.filter((cookie) => !isSessionCookieWrite(cookie));
    if (kept.length === setCookies.length) {
        return response;
    }
    const headers = new Headers(response.headers);
    headers.delete("set-cookie");
    for (const cookie of kept) {
        headers.append("set-cookie", cookie);
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

function isSessionCookieWrite(cookie: string): boolean {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");
    if (separator < 0) {
        return false;
    }
    const name = pair.slice(0, separator).trim();
    // Cobre o cookie único e os chunks `.0`, `.1`, ... gerados quando o JWT passa de 4KB.
    if (name !== HR_SESSION_COOKIE_NAME && !name.startsWith(`${HR_SESSION_COOKIE_NAME}.`)) {
        return false;
    }
    // Valor vazio = remoção (sessão inválida/corrompida). Precisa chegar ao browser.
    return pair.slice(separator + 1).trim().length > 0;
}

export const config = {
    matcher: ["/((?!api|login|definir-senha|esqueci-senha|careers|ponto|_next/static|_next/image|favicon.ico|brand/).*)"],
};
