import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Marca as execuções em que o Auth.js consegue devolver `Set-Cookie` ao browser.
 *
 * O `jwt` callback roda em três contextos diferentes:
 *  - route handler `/api/auth/*` → a resposta HTTP carrega o cookie novo (persiste);
 *  - Server Action (`signIn`/`signOut`) → também persiste;
 *  - `auth()` em Server Component / render RSC → o next-auth descarta
 *    `authResponse.headers.getSetCookie()`, então nada é persistido.
 *
 * Sem essa distinção, um render RSC (e em produção cada prefetch de `<Link>` é um)
 * dispara `/auth/refresh`, o backend rotaciona e revoga o refresh token, e a resposta
 * some — o browser fica com um token revogado e a sessão cai no meio do uso.
 */
const sessionWriteContext = new AsyncLocalStorage<true>();

/** Executa `fn` marcando o contexto como capaz de persistir o cookie de sessão. */
export function runWithSessionWrite<T>(fn: () => T): T {
    return sessionWriteContext.run(true, fn);
}

/** `true` somente quando o cookie rotacionado será devolvido ao browser. */
export function canPersistSessionCookie(): boolean {
    return sessionWriteContext.getStore() === true;
}
