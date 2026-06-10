"use client";
import type { AppRoute } from "@/config/routes";
import { findRouteByHref } from "@/shared/workspace/workspace-routes";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { buildWorkspaceTabId } from "@/shared/workspace/workspace-tab-id";

export function useWorkspaceLink() {
    const nav = useWorkspaceNavigation();
    const navigate = (
        href: string,
        options?: { editingId?: string | null; isNew?: boolean; titleSuffix?: string; shortLabel?: string },
    ) => {
        const route = findRouteByHref(href);
        if (!route) return;
        if (options?.editingId) {
            nav.openRouteRecord(route, options.editingId, {
                titleSuffix: options.titleSuffix,
                shortLabel: options.shortLabel,
            });
            return;
        }
        const tabId = buildWorkspaceTabId(route.id, "list");
        const existing = useWorkspaceStore.getState().tabs.find((t) => t.id === tabId);
        if (existing) nav.focusTabById(tabId);
        else nav.openRouteModule(route, options?.shortLabel);
        if (options?.isNew) {
            nav.syncCrudUrl(tabId, { isNew: true });
        }
    };
    const navigateRoute = (route: AppRoute, options?: Parameters<typeof navigate>[1]) => {
        if (!route.href) return;
        navigate(route.href, options);
    };
    return { navigate, navigateRoute };
}
