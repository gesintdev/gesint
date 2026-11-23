/** Primeiro nome da sessão, ou o login quando o cadastro não tem nome. */
export function assistantUserLabel(name?: string | null, username?: string | null): string {
    const first = name?.trim().split(/\s+/)[0];
    if (first) return first;
    const login = username?.trim();
    if (login) return login;
    return "Usuário";
}

/**
 * Pergunta real enviada ao assistente ao abrir o chat pelo menu.
 * Fica fora da transcrição: a resposta é que inicia a conversa.
 */
export const ASSISTANT_MENU_OPENING_QUESTION =
    "Para que serve este menu e o que posso fazer nele?";
