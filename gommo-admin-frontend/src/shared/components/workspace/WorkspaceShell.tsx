"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

import { WorkspaceTabBar } from "@/shared/components/workspace/WorkspaceTabBar";
import {
    parseWorkspaceLocation,
    useWorkspaceLocation,
    useWorkspaceNavigation,
    workspaceUrlForTab,
    workspaceUrlWithCrud,
} from "@/shared/workspace/useWorkspaceNavigation";
import { DashboardView } from "@/shared/workspace/views/DashboardView";
import { getDashboardTab, useWorkspaceStore } from "@/shared/workspace/workspace.store";
import {
    DASHBOARD_HREF,
    DASHBOARD_ROUTE_ID,
    DASHBOARD_TAB_ID,
    isDashboardTabId,
    stripDashboardTabs,
} from "@/shared/workspace/workspace-dashboard";
import {
    buildLocationKey,
    readLastWorkspaceInitLocation,
    replaceUrlIfNeeded,
    writeLastWorkspaceInitLocation,
} from "@/shared/workspace/workspace-location";
import { getWorkspacePageComponent } from "@/shared/workspace/workspace-page-registry";
import { findRouteByHref } from "@/shared/workspace/workspace-routes";
import { buildWorkspaceTabId } from "@/shared/workspace/workspace-tab-id";
import { WorkspaceTabProvider } from "@/shared/workspace/WorkspaceTabContext";

export function WorkspaceShell() {
    const { pathname, searchParams, router } = useWorkspaceLocation();
    const tabs = useWorkspaceStore((s) => s.tabs);
    const activeTabId = useWorkspaceStore((s) => s.activeTabId);
    const hasHydrated = useWorkspaceStore((s) => s._hasHydrated);
    const { focusTabById, openFromHref, openRouteRecord } = useWorkspaceNavigation();
    const closeTab = useWorkspaceStore((s) => s.closeTab);
    const [mountedTabIds, setMountedTabIds] = useState<Set<string>>(() => new Set());
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
        const currentKey = buildLocationKey(pathname, searchParams);
        if (readLastWorkspaceInitLocation() === currentKey) return;
        const state = useWorkspaceStore.getState();
        if (state.activeTabId && isDashboardTabId(state.activeTabId)) {
            writeLastWorkspaceInitLocation(DASHBOARD_HREF);
            return;
        }

        if (state.tabs.length > 0 && state.activeTabId) {
            const active = state.tabs.find((t) => t.id === state.activeTabId);
            if (active) {
                const targetUrl = workspaceUrlForTab(active.href, active.id);
                replaceUrlIfNeeded(router, pathname, searchParams, targetUrl);
                writeLastWorkspaceInitLocation(targetUrl);
                return;
            }
        }
        const parsed = parseWorkspaceLocation(pathname, searchParams.toString());
        if (!parsed) {
            writeLastWorkspaceInitLocation(currentKey);
            return;
        }
        const route = findRouteByHref(parsed.href);
        if (!route) {
            writeLastWorkspaceInitLocation(currentKey);
            return;
        }

        if (route.id === DASHBOARD_ROUTE_ID) {
            focusTabById(DASHBOARD_TAB_ID);
            writeLastWorkspaceInitLocation(DASHBOARD_HREF);
            return;
        }

        if (parsed.editingId) {
            const targetUrl = workspaceUrlWithCrud(parsed.href, { editingId: parsed.editingId });
            openRouteRecord(route, parsed.editingId);
            writeLastWorkspaceInitLocation(targetUrl);
            return;
        }
        const listTabId = buildWorkspaceTabId(route.id, "list");
        const existingList = state.tabs.find((t) => t.id === listTabId);
        if (existingList) {
            focusTabById(existingList.id);
            const targetUrl = parsed.isNew ? workspaceUrlWithCrud(parsed.href, { isNew: true }) : currentKey;
            if (parsed.isNew) {
                replaceUrlIfNeeded(router, pathname, searchParams, targetUrl);
            }
            writeLastWorkspaceInitLocation(targetUrl);
            return;
        }
        openFromHref(parsed.href);
        const targetUrl = parsed.isNew ? workspaceUrlWithCrud(parsed.href, { isNew: true }) : parsed.href;
        if (parsed.isNew) {
            replaceUrlIfNeeded(router, pathname, searchParams, targetUrl);
        }
        writeLastWorkspaceInitLocation(targetUrl);
    }, [focusTabById, hasHydrated, openFromHref, openRouteRecord, pathname, router, searchParams]);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {hasHydrated ? (
                <WorkspaceTabBar
                    dashboardTab={dashboardTab}
                    moduleTabs={moduleTabs}
                    activeTabId={activeTabId}
                    onSelect={focusTabById}
                    onClose={closeTab}
                />
            ) : null}
            <div className="workspace-content relative min-h-0 flex-1 overflow-hidden">
                {showDashboard ? (
                    <div className="workspace-panel absolute inset-0">
                        <DashboardView />
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
                                !active && "pointer-events-none invisible",
                            )}
                            aria-hidden={!active}
                        >
                            <WorkspaceTabProvider tab={tab}>
                                <Page />
                            </WorkspaceTabProvider>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
