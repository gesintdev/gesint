"use client";
import { useTabbedCrudConfigOptional } from "@/shared/workspace/TabbedCrudConfigContext";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";
import { findRouteById } from "@/shared/workspace/workspace-routes";

export function useOpenWorkspaceRecordTab() {
    const cfg = useTabbedCrudConfigOptional();
    const { openRouteRecord } = useWorkspaceNavigation();
    return (row: { id: string } & object) => {
        if (!cfg) return;
        const route = findRouteById(cfg.routeId);
        if (!route) return;
        const titleSuffix =
            cfg.fieldTabName && cfg.fieldTabName in row
                ? String(row[cfg.fieldTabName as keyof typeof row] ?? "")
                : undefined;
        openRouteRecord(route, row.id, {
            titleSuffix: titleSuffix || undefined,
            shortLabel: cfg.tabShortLabel,
        });
    };
}
