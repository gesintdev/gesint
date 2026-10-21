/** Filial ativa: escolha explicita do usuario, diferente do tenant que vem do host. */

export const BRANCH_HEADER = "X-Branch-Id";
export const ACTIVE_BRANCH_STORAGE_KEY = "gesint-active-branch";
export const ACTIVE_BRANCH_COOKIE_KEY = "gesint-active-branch";
export const ACTIVE_BRANCH_EVENT = "gesint-active-branch-change";

export type Branch = {
    id: string;
    name: string;
    cnpj?: string | null;
    headquarters: boolean;
};

export function buildBranchRequestHeaders(branchId?: string | null): Record<string, string> {
    const id = branchId?.trim();
    if (!id) {
        return {};
    }
    return { [BRANCH_HEADER]: id };
}

export function subscribeActiveBranch(onStoreChange: () => void): () => void {
    if (typeof window === "undefined") {
        return () => {};
    }
    const handler = () => onStoreChange();
    window.addEventListener(ACTIVE_BRANCH_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
        window.removeEventListener(ACTIVE_BRANCH_EVENT, handler);
        window.removeEventListener("storage", handler);
    };
}

function readActiveBranchFromCookie(): string | null {
    if (typeof document === "undefined") {
        return null;
    }
    const match = document.cookie.match(new RegExp(`(?:^|; )${ACTIVE_BRANCH_COOKIE_KEY}=([^;]*)`));
    const value = decodeURIComponent(match?.[1] ?? "").trim();
    return value || null;
}

export function readActiveBranch(): string | null {
    if (typeof window === "undefined") {
        return null;
    }
    return window.localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY) || readActiveBranchFromCookie();
}

/**
 * Cookie alem do localStorage porque o Server Component precisa conhecer a filial ativa antes
 * da hidratacao, evitando o pisca de conteudo da filial errada.
 */
export function persistActiveBranch(branchId: string | null): void {
    if (typeof window === "undefined") {
        return;
    }
    if (branchId) {
        window.localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, branchId);
        document.cookie = `${ACTIVE_BRANCH_COOKIE_KEY}=${encodeURIComponent(branchId)};path=/;max-age=31536000;SameSite=Lax`;
    } else {
        window.localStorage.removeItem(ACTIVE_BRANCH_STORAGE_KEY);
        document.cookie = `${ACTIVE_BRANCH_COOKIE_KEY}=;path=/;max-age=0;SameSite=Lax`;
    }
    window.dispatchEvent(new Event(ACTIVE_BRANCH_EVENT));
}
