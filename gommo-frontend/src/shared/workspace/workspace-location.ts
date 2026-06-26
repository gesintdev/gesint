import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function buildLocationKey(pathname: string, search: URLSearchParams | string): string {
    const qs = typeof search === "string" ? search : search.toString();
    return qs ? `${pathname}?${qs}` : pathname;
}

function browserLocationKey(): string | null {
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

export function replaceUrlIfNeeded(
    router: AppRouterInstance,
    pathname: string,
    searchParams: URLSearchParams,
    targetUrl: string,
): void {
    const current = browserLocationKey() ?? buildLocationKey(pathname, searchParams);
    if (locationsEqual(current, targetUrl)) return;
    if (typeof window !== "undefined") {
        window.history.replaceState(window.history.state, "", targetUrl);
    } else {
        router.replace(targetUrl, { scroll: false });
    }
    writeLastWorkspaceInitLocation(targetUrl);
}

const LAST_INIT_KEY = "gommo.workspace.lastInitLocation";

export function readLastWorkspaceInitLocation(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(LAST_INIT_KEY);
}

export function writeLastWorkspaceInitLocation(locationKey: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(LAST_INIT_KEY, locationKey);
}
