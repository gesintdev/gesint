import { handlers } from "@/auth";

/**
 * Deve usar o handler do Auth.js (não `auth()` + Response.json).
 * Só o handler persiste o JWT atualizado via Set-Cookie após refresh;
 * sem isso o cookie fica com refresh token antigo e o backend revoga a sessão na rotação.
 */
export const GET = handlers.GET;
