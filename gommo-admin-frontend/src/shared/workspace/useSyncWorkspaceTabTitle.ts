"use client";

import { useEffect } from "react";

import { useTabbedCrudConfigOptional } from "@/shared/workspace/TabbedCrudConfigContext";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";

export function useSyncWorkspaceTabTitle<T extends object>(data: T | undefined | null) {
    const cfg = useTabbedCrudConfigOptional();
    const wsTab = useWorkspaceTabOptional();
    const setTitleSuffix = useWorkspaceStore((s) => s.setTitleSuffix);
    const field = cfg?.fieldTabName as keyof T | undefined;
    const tabId = wsTab?.tab.id;
    const currentSuffix = wsTab?.tab.titleSuffix;
    useEffect(() => {
        if (!tabId || !data || !field) return;
        const raw = data[field];
        if (raw == null || raw === "") return;
        const next = String(raw);
        if (currentSuffix === next) return;
        setTitleSuffix(tabId, next);
    }, [currentSuffix, data, field, setTitleSuffix, tabId]);
}
