"use client";

import {createContext, useContext, type ReactNode} from "react";

const PopoverPortalContext = createContext<HTMLElement | null>(null);

export function PopoverPortalProvider({
    container,
    children,
}: {
    container: HTMLElement | null;
    children: ReactNode;
}) {
    return <PopoverPortalContext.Provider value={container}>{children}</PopoverPortalContext.Provider>;
}

/** Prefer dialog/modal container when present so popovers stay on the top layer. */
export function usePopoverPortalRoot(): HTMLElement | null {
    const container = useContext(PopoverPortalContext);
    if (typeof document === "undefined") return null;
    return container ?? document.body;
}
