"use client";

import {createContext, useContext, type ReactNode} from "react";

export type TabbedCrudConfig = {
    routeId: string;
    href: string;
    routeLabel: string;
    tabShortLabel: string;
    /** Nome do campo usado no título da aba (definido via TabbedCrudPage). */
    fieldTabName?: string | undefined;
};

const TabbedCrudConfigContext = createContext<TabbedCrudConfig | null>(null);

export function TabbedCrudConfigProvider({
    value,
    children,
}: {
    value: TabbedCrudConfig;
    children: ReactNode;
}) {
    return (
        <TabbedCrudConfigContext.Provider value={value}>{children}</TabbedCrudConfigContext.Provider>
    );
}

export function useTabbedCrudConfig(): TabbedCrudConfig {
    const ctx = useContext(TabbedCrudConfigContext);
    if (!ctx) throw new Error("useTabbedCrudConfig deve ser usado dentro de TabbedCrudPage");
    return ctx;
}

export function useTabbedCrudConfigOptional(): TabbedCrudConfig | null {
    return useContext(TabbedCrudConfigContext);
}
