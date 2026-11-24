export function buildLocationKey(pathname: string, search: URLSearchParams | string): string {
    const qs = typeof search === "string" ? search : search.toString();
    return qs ? `${pathname}?${qs}` : pathname;
}

/** URL real do browser — pode estar à frente do `usePathname` do Next por um instante. */
export function readBrowserLocationKey(): string | null {
    if (typeof window === "undefined") return null;
    return buildLocationKey(window.location.pathname, window.location.search.slice(1));
}

export function locationsEqual(current: string, target: string): boolean {
    if (current === target) return true;
    try {
        const currentUrl = new URL(current, "http://local");
        const targetUrl = new URL(target, "http://local");
        if (currentUrl.pathname !== targetUrl.pathname) return false;
        const currentParams = new URLSearchParams(currentUrl.search);
        const targetParams = new URLSearchParams(targetUrl.search);
        if (currentParams.size !== targetParams.size) return false;
        for (const [key, value] of currentParams) {
            if (targetParams.get(key) !== value) return false;
        }
        return true;
    } catch {
        return false;
    }
}

export type WorkspaceHistoryMode = "push" | "replace" | "none";

/**
 * Grava a URL no histórico na hora do clique.
 *
 * O App Router só empilha `router.push` depois do payload da rota. A aba nova
 * já aparece antes disso, e o voltar desfaz a tela anterior. `pushState` e
 * `replaceState` com dado vazio passam pelo patch do App Router, que
 * sincroniza o estado interno junto com a entrada.
 */
function writeWorkspaceHistory(targetUrl: string, mode: Exclude<WorkspaceHistoryMode, "none">): void {
    const method = mode === "push" ? "pushState" : "replaceState";
    window.history[method](null, "", targetUrl);
}

export function commitWorkspaceUrl(
    targetUrl: string,
    mode: Exclude<WorkspaceHistoryMode, "none">,
): void {
    const current = readBrowserLocationKey();
    if (current && locationsEqual(current, targetUrl)) {
        writeLastWorkspaceInitLocation(targetUrl);
        return;
    }
    writeLastWorkspaceInitLocation(targetUrl);
    writeWorkspaceHistory(targetUrl, mode);
}

export function replaceUrlIfNeeded(targetUrl: string): void {
    commitWorkspaceUrl(targetUrl, "replace");
}

export function pushUrlIfNeeded(targetUrl: string): void {
    commitWorkspaceUrl(targetUrl, "push");
}

const LAST_INIT_KEY = "gesint.workspace.lastInitLocation";

export function readLastWorkspaceInitLocation(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(LAST_INIT_KEY);
}

export function writeLastWorkspaceInitLocation(locationKey: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(LAST_INIT_KEY, locationKey);
}
