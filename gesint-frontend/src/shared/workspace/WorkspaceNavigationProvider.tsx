"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {createContext, type ReactNode, useCallback, useContext, useMemo} from "react";

import type {AppRoute} from "@/config/routes";
import {useWorkspaceStore} from "@/shared/workspace/workspace.store";
import {DASHBOARD_HREF, isDashboardTabId} from "@/shared/workspace/workspace-dashboard";
import {commitWorkspaceUrl, type WorkspaceHistoryMode} from "@/shared/workspace/workspace-location";
import {workspaceUrl, workspaceUrlWithCrud} from "@/shared/workspace/workspace-navigation-url";
import {defaultShortLabel, findRouteByHref} from "@/shared/workspace/workspace-routes";
import {buildWorkspaceTabId, parseWorkspaceTabId} from "@/shared/workspace/workspace-tab-id";

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
    openRouteModule: (route: AppRoute, shortLabel?: string, history?: WorkspaceHistoryMode) => void;
    openRouteRecord: (
        route: AppRoute,
        entityId: string,
        options?: { titleSuffix?: string; shortLabel?: string; history?: WorkspaceHistoryMode },
    ) => void;
    openRouteCreate: (
        route: AppRoute,
        shortLabel?: string,
        options?: { insertAfterTabId?: string; history?: WorkspaceHistoryMode },
    ) => void;
    openFromHref: (href: string, history?: WorkspaceHistoryMode) => void;
    focusTabById: (tabId: string, history?: WorkspaceHistoryMode) => void;
    syncCrudUrl: (
        tabId: string,
        crud: { editingId?: string | null; isNew?: boolean },
        history?: WorkspaceHistoryMode,
    ) => void;
};

type WorkspaceNavigationContextValue = WorkspaceNavigationApi & {
    pathname: string;
    searchParams: ReturnType<typeof useSearchParams>;
    router: ReturnType<typeof useRouter>;
};

const WorkspaceNavigationContext = createContext<WorkspaceNavigationContextValue | null>(null);

export function WorkspaceNavigationProvider({children}: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const openModuleTab = useWorkspaceStore((s) => s.openModuleTab);
    const openRecordTab = useWorkspaceStore((s) => s.openRecordTab);
    const focusTab = useWorkspaceStore((s) => s.focusTab);
    const syncUrl = useCallback(
        (
            href: string,
            crud?: { editingId?: string | null; isNew?: boolean },
            history: WorkspaceHistoryMode = "push",
        ) => {
            if (history === "none") return;
            const url = crud ? workspaceUrlWithCrud(href, crud) : workspaceUrl(href);
            commitWorkspaceUrl(url, history);
        },
        [],
    );
    const openRouteModule = useCallback(
        (route: AppRoute, shortLabel?: string, history: WorkspaceHistoryMode = "push") => {
            const input = routeToInput(route, shortLabel);
            const listTabId = buildWorkspaceTabId(input.routeId, "list");
            const state = useWorkspaceStore.getState();
            const existing = state.tabs.find((tab) => tab.id === listTabId);
            if (existing) {
                if (state.activeTabId !== existing.id) {
                    focusTab(existing.id);
                    syncUrl(existing.href, undefined, history);
                }
                return;
            }
            openModuleTab(input);
            syncUrl(input.href, undefined, history);
        },
        [focusTab, openModuleTab, syncUrl],
    );
    const openRouteRecord = useCallback(
        (route: AppRoute, entityId: string, options?: { titleSuffix?: string; shortLabel?: string; history?: WorkspaceHistoryMode }) => {
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
            syncUrl(input.href, {editingId: entityId}, options?.history ?? "push");
        },
        [focusTab, openRecordTab, syncUrl],
    );
    const openRouteCreate = useCallback(
        (route: AppRoute, shortLabel?: string, options?: { insertAfterTabId?: string; history?: WorkspaceHistoryMode }) => {
            const input = routeToInput(route, shortLabel);
            openRecordTab(
                {
                    ...input,
                    entityKey: "new",
                },
                { insertAfterTabId: options?.insertAfterTabId },
            );
            syncUrl(input.href, { isNew: true }, options?.history ?? "push");
        },
        [openRecordTab, syncUrl],
    );
    const openFromHref = useCallback(
        (href: string, history: WorkspaceHistoryMode = "push") => {
            const qIndex = href.indexOf("?");
            const path = (qIndex >= 0 ? href.slice(0, qIndex) : href).trim();
            const search = qIndex >= 0 ? href.slice(qIndex + 1) : "";
            const route = findRouteByHref(path);
            if (!route?.href) return;
            const params = new URLSearchParams(search);
            const editingId = params.get("edit");
            if (editingId) {
                openRouteRecord(route, editingId, { history });
                return;
            }
            if (params.has("new")) {
                openRouteCreate(route, undefined, { history });
                return;
            }
            openRouteModule(route, undefined, history);
        },
        [openRouteCreate, openRouteModule, openRouteRecord],
    );
    const focusTabById = useCallback(
        (tabId: string, history: WorkspaceHistoryMode = "push") => {
            focusTab(tabId);
            if (isDashboardTabId(tabId)) {
                syncUrl(DASHBOARD_HREF, undefined, history);
                return;
            }
            const tab = useWorkspaceStore.getState().tabs.find((t) => t.id === tabId);
            if (!tab) return;
            const {entityKey} = parseWorkspaceTabId(tabId);
            if (entityKey === "new") {
                syncUrl(tab.href, {isNew: true}, history);
            } else if (entityKey !== "list") {
                syncUrl(tab.href, {editingId: entityKey}, history);
            } else {
                syncUrl(tab.href, undefined, history);
            }
        },
        [focusTab, syncUrl],
    );
    const syncCrudUrl = useCallback(
        (
            tabId: string,
            crud: { editingId?: string | null; isNew?: boolean },
            history: WorkspaceHistoryMode = "push",
        ) => {
            const tab = useWorkspaceStore.getState().tabs.find((t) => t.id === tabId);
            if (!tab) return;
            syncUrl(tab.href, crud, history);
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
