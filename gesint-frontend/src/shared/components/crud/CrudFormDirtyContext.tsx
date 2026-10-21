"use client";

import { createContext, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { registerTabDirtyGuard } from "@/shared/workspace/dirty-tab-guard";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";

type CrudFormDirtyContextValue = {
    setFormDirty: (dirty: boolean) => void;
};

export const CrudFormDirtyContext = createContext<CrudFormDirtyContextValue | null>(null);

export function CrudFormDirtyProvider({ children }: { children: ReactNode }) {
    const workspaceTabCtx = useWorkspaceTabOptional();
    const [isFormDirty, setIsFormDirty] = useState(false);

    const setFormDirty = useCallback((dirty: boolean) => {
        setIsFormDirty(dirty);
    }, []);

    useEffect(() => {
        const tabId = workspaceTabCtx?.tab.id;
        if (!tabId) return;
        return registerTabDirtyGuard(tabId, () => isFormDirty);
    }, [isFormDirty, workspaceTabCtx?.tab.id]);

    const value = useMemo(() => ({ setFormDirty }), [setFormDirty]);

    return <CrudFormDirtyContext.Provider value={value}>{children}</CrudFormDirtyContext.Provider>;
}
