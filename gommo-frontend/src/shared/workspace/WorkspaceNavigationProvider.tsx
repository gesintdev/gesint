"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";

import type { AppRoute } from "@/config/routes";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { DASHBOARD_HREF, isDashboardTabId } from "@/shared/workspace/workspace-dashboard";
import { replaceUrlIfNeeded } from "@/shared/workspace/workspace-location";
import { workspaceUrl, workspaceUrlWithCrud } from "@/shared/workspace/workspace-navigation-url";
import { defaultShortLabel, findRouteByHref } from "@/shared/workspace/workspace-routes";
import { buildWorkspaceTabId, parseWorkspaceTabId } from "@/shared/workspace/workspace-tab-id";

function routeToInput(route: AppRoute, shortLabel?: string) {
    if (!route.href) throw new Error(`Rota ${route.id} sem href`);
    return {
        routeId: route.id,
        href: route.href,
        routeLabel: route.label,
        shortLabel: shortLabel ?? route.tabShortLabel ?? defaultShortLabel(route.label),
        icon: route.icon,
    };
}

export type WorkspaceNavigationApi = {
    openRouteModule: (route: AppRoute, shortLabel?: string) => void;
    openRouteRecord: (
        route: AppRoute,
        entityId: string,
        options?: { titleSuffix?: string; shortLabel?: string },
    ) => void;
    openRouteCreate: (route: AppRoute, shortLabel?: string) => void;
    openFromHref: (href: string) => void;
    focusTabById: (tabId: string) => void;
    syncCrudUrl: (tabId: string, crud: { editingId?: string | null; isNew?: boolean }) => void;
};

type WorkspaceNavigationContextValue = WorkspaceNavigationApi & {
    pathname: string;
    searchParams: ReturnType<typeof useSearchParams>;
    router: ReturnType<typeof useRouter>;
};

const WorkspaceNavigationContext = createContext<WorkspaceNavigationContextValue | null>(null);

export function WorkspaceNavigationProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const openModuleTab = useWorkspaceStore((s) => s.openModuleTab);
    const openRecordTab = useWorkspaceStore((s) => s.openRecordTab);
    const focusTab = useWorkspaceStore((s) => s.focusTab);

    const syncUrl = useCallback(
        (href: string, crud?: { editingId?: string | null; isNew?: boolean }) => {
            const url = crud ? workspaceUrlWithCrud(href, crud) : workspaceUrl(href);
            replaceUrlIfNeeded(router, pathname, searchParams, url);
        },
        [pathname, router, searchParams],
    );

    const openRouteModule = useCallback(
        (route: AppRoute, shortLabel?: string) => {
            const input = routeToInput(route, shortLabel);
            openModuleTab(input);
            syncUrl(input.href);
        },
        [openModuleTab, syncUrl],
    );

    const openRouteRecord = useCallback(
        (route: AppRoute, entityId: string, options?: { titleSuffix?: string; shortLabel?: string }) => {
            const input = routeToInput(route, options?.shortLabel);
            const tabId = buildWorkspaceTabId(input.routeId, entityId);
            const existing = useWorkspaceStore.getState().tabs.find((t) => t.id === tabId);
            if (existing) {
                focusTab(tabId);
                if (options?.titleSuffix) {
                    useWorkspaceStore.getState().setTitleSuffix(tabId, options.titleSuffix);
                }
            } else {
                openRecordTab({
                    ...input,
                    entityKey: entityId,
                    titleSuffix: options?.titleSuffix,
                });
            }
            syncUrl(input.href, { editingId: entityId });
        },
        [focusTab, openRecordTab, syncUrl],
    );

    const openRouteCreate = useCallback(
        (route: AppRoute, shortLabel?: string) => {
            const input = routeToInput(route, shortLabel);
            const tabId = buildWorkspaceTabId(input.routeId, "new");
            const existing = useWorkspaceStore.getState().tabs.find((t) => t.id === tabId);
            if (existing) {
                focusTab(tabId);
            } else {
                openRecordTab({
                    ...input,
                    entityKey: "new",
                });
            }
            syncUrl(input.href, { isNew: true });
        },
        [focusTab, openRecordTab, syncUrl],
    );

    const openFromHref = useCallback(
        (href: string) => {
            const route = findRouteByHref(href);
            if (!route?.href) return;
            openRouteModule(route);
        },
        [openRouteModule],
    );

    const focusTabById = useCallback(
        (tabId: string) => {
            focusTab(tabId);
            if (isDashboardTabId(tabId)) {
                syncUrl(DASHBOARD_HREF);
                return;
            }
            const tab = useWorkspaceStore.getState().tabs.find((t) => t.id === tabId);
            if (!tab) return;
            const { entityKey } = parseWorkspaceTabId(tabId);
            if (entityKey === "new") {
                syncUrl(tab.href, { isNew: true });
            } else if (entityKey !== "list") {
                syncUrl(tab.href, { editingId: entityKey });
            } else {
                syncUrl(tab.href);
            }
        },
        [focusTab, syncUrl],
    );

    const syncCrudUrl = useCallback(
        (tabId: string, crud: { editingId?: string | null; isNew?: boolean }) => {
            const tab = useWorkspaceStore.getState().tabs.find((t) => t.id === tabId);
            if (!tab) return;
            syncUrl(tab.href, crud);
        },
        [syncUrl],
    );

    const value = useMemo(
        (): WorkspaceNavigationContextValue => ({
            pathname,
            searchParams,
            router,
            openRouteModule,
            openRouteRecord,
            openRouteCreate,
            openFromHref,
            focusTabById,
            syncCrudUrl,
        }),
        [
            focusTabById,
            openFromHref,
            openRouteCreate,
            openRouteModule,
            openRouteRecord,
            pathname,
            router,
            searchParams,
            syncCrudUrl,
        ],
    );

    return <WorkspaceNavigationContext.Provider value={value}>{children}</WorkspaceNavigationContext.Provider>;
}

export function useWorkspaceNavigation(): WorkspaceNavigationApi {
    const ctx = useContext(WorkspaceNavigationContext);
    if (!ctx) {
        throw new Error("useWorkspaceNavigation requires WorkspaceNavigationProvider");
    }
    return ctx;
}

export function useWorkspaceLocation() {
    const ctx = useContext(WorkspaceNavigationContext);
    if (!ctx) {
        throw new Error("useWorkspaceLocation requires WorkspaceNavigationProvider");
    }
    return {
        pathname: ctx.pathname,
        searchParams: ctx.searchParams,
        router: ctx.router,
    };
}
