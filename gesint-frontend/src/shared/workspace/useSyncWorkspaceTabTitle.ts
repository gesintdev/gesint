"use client";

import { useEffect } from "react";

import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTabbedCrudConfigOptional } from "@/shared/workspace/TabbedCrudConfigContext";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";

export function useSyncWorkspaceTabTitle<T extends object>(data: T | undefined | null) {
    const cfg = useTabbedCrudConfigOptional();
    const wsTab = useWorkspaceTabOptional();
    const { isEditing } = useCrudScreen();
    const setTitleSuffix = useWorkspaceStore((s) => s.setTitleSuffix);
    const field = cfg?.fieldTabName as keyof T | undefined;
    const tabId = wsTab?.tab.id;
    useEffect(() => {
        if (!tabId || !data || !field || !isEditing) return;
        const raw = data[field];
        if (raw == null || raw === "") return;
        const next = String(raw);
        setTitleSuffix(tabId, next);
    }, [data, field, isEditing, setTitleSuffix, tabId]);
}
