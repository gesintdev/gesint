"use client";

type Listener = (pathname: string) => void;

let currentPathname =
    typeof window !== "undefined" ? window.location.pathname : "";
const listeners = new Set<Listener>();

export function getAdminPathname() {
    if (typeof window !== "undefined") {
        return currentPathname || window.location.pathname;
    }
    return currentPathname;
}

export function setAdminPathname(pathname: string, mode: "push" | "replace" = "push") {
    currentPathname = pathname;
    if (typeof window !== "undefined") {
        if (mode === "replace") {
            window.history.replaceState(window.history.state, "", pathname);
        } else {
            window.history.pushState(window.history.state, "", pathname);
        }
    }
    listeners.forEach((listener) => listener(currentPathname));
}

export function syncAdminPathnameFromLocation() {
    if (typeof window === "undefined") return;
    currentPathname = window.location.pathname;
    listeners.forEach((listener) => listener(currentPathname));
}

export function subscribeAdminPathname(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** @deprecated use setAdminPathname */
export function setOptimisticPathname(pathname: string | null) {
    if (pathname) setAdminPathname(pathname, "replace");
}

/** @deprecated use getAdminPathname */
export function getOptimisticPathname() {
    return getAdminPathname();
}

/** @deprecated use subscribeAdminPathname */
export function subscribeOptimisticPathname(listener: (pathname: string | null) => void) {
    return subscribeAdminPathname(listener);
}
