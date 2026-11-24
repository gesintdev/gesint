"use client";

import clsx from "clsx";
import {useEffect, useMemo, useRef, useState} from "react";

import {WorkspaceTabBar} from "@/shared/components/workspace/WorkspaceTabBar";
import {
    parseWorkspaceLocation,
    useWorkspaceLocation,
    useWorkspaceNavigation,
    workspaceUrlForTab,
    workspaceUrlWithCrud,
} from "@/shared/workspace/useWorkspaceNavigation";
import {DashboardView} from "@/shared/workspace/views/DashboardView";
import {getDashboardTab, useWorkspaceStore} from "@/shared/workspace/workspace.store";
import {
    DASHBOARD_HREF,
    DASHBOARD_ROUTE_ID,
    DASHBOARD_TAB_ID,
    isDashboardTabId,
    stripDashboardTabs,
} from "@/shared/workspace/workspace-dashboard";
import {WorkspaceHistoryCommitProvider, type WorkspaceHistoryCommit} from "@/shared/workspace/workspace-history";
import {
    buildLocationKey,
    locationsEqual,
    readBrowserLocationKey,
    readLastWorkspaceInitLocation,
    replaceUrlIfNeeded,
    writeLastWorkspaceInitLocation,
} from "@/shared/workspace/workspace-location";
import {getWorkspacePageComponent} from "@/shared/workspace/workspace-page-registry";
import {defaultShortLabel, findRouteByHref} from "@/shared/workspace/workspace-routes";
import {buildWorkspaceTabId} from "@/shared/workspace/workspace-tab-id";
import {WorkspaceTabProvider} from "@/shared/workspace/WorkspaceTabContext";

/** Voltar/avançar: reabre a tela da URL sem empilhar outro passo no histórico. */
function restoreHistoryLocation(pathname: string, search: string) {
    const parsed = parseWorkspaceLocation(pathname, search);
    const route = parsed ? findRouteByHref(parsed.href) : undefined;
    const store = useWorkspaceStore.getState();
    if (!parsed || !route?.href) return;

    if (route.id === DASHBOARD_ROUTE_ID) {
        store.focusTab(DASHBOARD_TAB_ID);
        return;
    }

    const listId = buildWorkspaceTabId(route.id, "list");
    const input = {
        routeId: route.id,
        href: route.href,
        routeLabel: route.label,
        shortLabel: route.tabShortLabel ?? defaultShortLabel(route.label),
        icon: route.icon,
    };

    if (parsed.editingId) {
        const recordId = buildWorkspaceTabId(route.id, parsed.editingId);
        if (store.tabs.some((tab) => tab.id === recordId)) {
            store.focusTab(recordId);
            return;
        }
        if (store.tabs.some((tab) => tab.id === listId)) {
            store.focusTab(listId);
            return;
        }
        store.openRecordTab({ ...input, entityKey: parsed.editingId });
        return;
    }

    if (store.tabs.some((tab) => tab.id === listId)) {
        store.focusTab(listId);
        return;
    }

    if (parsed.isNew) {
        store.openRecordTab({ ...input, entityKey: "new" });
        return;
    }

    store.openModuleTab(input);
}

export function WorkspaceShell() {
    const {pathname, searchParams} = useWorkspaceLocation();
    const tabs = useWorkspaceStore((s) => s.tabs);
    const activeTabId = useWorkspaceStore((s) => s.activeTabId);
    const hasHydrated = useWorkspaceStore((s) => s._hasHydrated);
    const {focusTabById, openFromHref, openRouteCreate, openRouteRecord} = useWorkspaceNavigation();
    const closeTab = useWorkspaceStore((s) => s.closeTab);

    const handleCloseTab = async (tabId: string) => {
        const { confirmCloseDirtyTab } = await import("@/shared/workspace/dirty-tab-guard");
        if (await confirmCloseDirtyTab(tabId)) {
            closeTab(tabId);
            const nextActiveId = useWorkspaceStore.getState().activeTabId;
            if (nextActiveId) focusTabById(nextActiveId, "replace");
        }
    };
    const [mountedTabIds, setMountedTabIds] = useState<Set<string>>(() => new Set());
    const [historyCommit, setHistoryCommit] = useState<WorkspaceHistoryCommit | null>(null);
    const didInitRef = useRef(false);
    const dashboardTab = useMemo(() => getDashboardTab(), []);
    const moduleTabs = useMemo(() => stripDashboardTabs(tabs), [tabs]);
    const showDashboard = isDashboardTabId(activeTabId);

    useEffect(() => {
        if (activeTabId && !isDashboardTabId(activeTabId)) {
            setMountedTabIds((prev) => {
                if (prev.has(activeTabId)) return prev;
                const next = new Set(prev);
                next.add(activeTabId);
                return next;
            });
        }
    }, [activeTabId]);

    useEffect(() => {
        if (!hasHydrated) return;
        // A URL real fica à frente do usePathname por um instante. Usá-la evita reabrir o
        // Painel e “piscar” a tela (ex.: o 100% do anel de progresso).
        const browserKey = readBrowserLocationKey();
        const currentKey = browserKey ?? buildLocationKey(pathname, searchParams);
        const previousKey = readLastWorkspaceInitLocation();
        if (previousKey && locationsEqual(previousKey, currentKey)) {
            didInitRef.current = true;
            return;
        }

        const locationPath = browserKey ? window.location.pathname : pathname;
        const locationSearch = browserKey ? window.location.search.slice(1) : searchParams.toString();

        if (didInitRef.current) {
            restoreHistoryLocation(locationPath, locationSearch);
            writeLastWorkspaceInitLocation(currentKey);
            setHistoryCommit((current) => ({ key: currentKey, epoch: (current?.epoch ?? 0) + 1 }));
            return;
        }

        didInitRef.current = true;
        const state = useWorkspaceStore.getState();
        const parsed = parseWorkspaceLocation(locationPath, locationSearch);
        const route = parsed ? findRouteByHref(parsed.href) : undefined;
        if (parsed && route) {
            if (route.id === DASHBOARD_ROUTE_ID) {
                focusTabById(DASHBOARD_TAB_ID, "none");
                writeLastWorkspaceInitLocation(DASHBOARD_HREF);
                setHistoryCommit({ key: DASHBOARD_HREF, epoch: 1 });
                return;
            }

            if (parsed.editingId) {
                const targetUrl = workspaceUrlWithCrud(parsed.href, {editingId: parsed.editingId});
                openRouteRecord(route, parsed.editingId, { history: "none" });
                writeLastWorkspaceInitLocation(targetUrl);
                setHistoryCommit({ key: targetUrl, epoch: 1 });
                return;
            }

            if (parsed.isNew) {
                const targetUrl = workspaceUrlWithCrud(parsed.href, {isNew: true});
                openRouteCreate(route, undefined, { history: "none" });
                writeLastWorkspaceInitLocation(targetUrl);
                setHistoryCommit({ key: targetUrl, epoch: 1 });
                return;
            }
            const listTabId = buildWorkspaceTabId(route.id, "list");
            const existingList = state.tabs.find((t) => t.id === listTabId);
            if (existingList) {
                focusTabById(existingList.id, "none");
                writeLastWorkspaceInitLocation(currentKey);
                setHistoryCommit({ key: currentKey, epoch: 1 });
                return;
            }
            openFromHref(parsed.href, "none");
            writeLastWorkspaceInitLocation(parsed.href);
            setHistoryCommit({ key: parsed.href, epoch: 1 });
            return;
        }

        if (state.activeTabId && isDashboardTabId(state.activeTabId)) {
            writeLastWorkspaceInitLocation(DASHBOARD_HREF);
            setHistoryCommit({ key: DASHBOARD_HREF, epoch: 1 });
            return;
        }

        if (state.tabs.length > 0 && state.activeTabId) {
            const active = state.tabs.find((t) => t.id === state.activeTabId);
            if (active) {
                const targetUrl = workspaceUrlForTab(active.href, active.id);
                replaceUrlIfNeeded(targetUrl);
                writeLastWorkspaceInitLocation(targetUrl);
                setHistoryCommit({ key: targetUrl, epoch: 1 });
                return;
            }
        }
        writeLastWorkspaceInitLocation(currentKey);
        setHistoryCommit({ key: currentKey, epoch: 1 });
    }, [focusTabById, hasHydrated, openFromHref, openRouteCreate, openRouteRecord, pathname, searchParams]);

    return (
        <WorkspaceHistoryCommitProvider value={historyCommit}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {hasHydrated ? (
                <WorkspaceTabBar
                    dashboardTab={dashboardTab}
                    moduleTabs={moduleTabs}
                    activeTabId={activeTabId}
                    onSelect={focusTabById}
                    onClose={handleCloseTab}
                />
            ) : null}
            <div className="workspace-content relative min-h-0 flex-1 overflow-hidden">
                {showDashboard ? (
                    <div className="workspace-panel absolute inset-0 z-10">
                        <DashboardView/>
                    </div>
                ) : null}
                {moduleTabs.map((tab) => {
                    if (!mountedTabIds.has(tab.id)) return null;
                    const Page = getWorkspacePageComponent(tab.href);
                    const active = tab.id === activeTabId;
                    if (!Page) return null;
                    return (
                        <div
                            key={tab.id}
                            className={clsx(
                                "workspace-panel absolute inset-0",
                                active ? "z-10" : "pointer-events-none",
                            )}
                            hidden={!active}
                            aria-hidden={!active}
                        >
                            <WorkspaceTabProvider tab={tab}>
                                <Page/>
                            </WorkspaceTabProvider>
                        </div>
                    );
                })}
            </div>
        </div>
        </WorkspaceHistoryCommitProvider>
    );
}
