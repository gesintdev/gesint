"use client";
import { createContext, type ReactNode, useContext, useMemo } from "react";

import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import type { WorkspaceTab } from "@/shared/workspace/workspace.types";

type WorkspaceTabContextValue = {
    tab: WorkspaceTab;
    setTitleSuffix: (suffix: string) => void;
};

const WorkspaceTabContext = createContext<WorkspaceTabContextValue | null>(null);

export function WorkspaceTabProvider({ tab, children }: { tab: WorkspaceTab; children: ReactNode }) {
    const setTitleSuffixAction = useWorkspaceStore((s) => s.setTitleSuffix);
    const tabId = tab.id;
    const value = useMemo(
        () => ({
            tab,
            setTitleSuffix: (suffix: string) => setTitleSuffixAction(tabId, suffix),
        }),
        [setTitleSuffixAction, tab, tabId],
    );

    return <WorkspaceTabContext.Provider value={value}>{children}</WorkspaceTabContext.Provider>;
}

export function useWorkspaceTab(): WorkspaceTabContextValue {
    const ctx = useContext(WorkspaceTabContext);
    if (!ctx) throw new Error("useWorkspaceTab deve ser usado dentro de WorkspaceTabProvider");
    return ctx;
}

export function useWorkspaceTabOptional(): WorkspaceTabContextValue | null {
    return useContext(WorkspaceTabContext);
}
