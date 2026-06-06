"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkspaceTabBar, WorkspaceTabBarEmptyHint } from "@/shared/components/workspace/WorkspaceTabBar";
import { DashboardView } from "@/shared/workspace/views/DashboardView";
import { WorkspaceTabProvider } from "@/shared/workspace/WorkspaceTabContext";
import { getWorkspacePageComponent } from "@/shared/workspace/workspace-page-registry";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { findRouteByHref } from "@/shared/workspace/workspace-routes";
import { buildWorkspaceTabId } from "@/shared/workspace/workspace-tab-id";
import {
    buildLocationKey,
    readLastWorkspaceInitLocation,
    replaceUrlIfNeeded,
    writeLastWorkspaceInitLocation,
} from "@/shared/workspace/workspace-location";
import {
    parseWorkspaceLocation,
    useWorkspaceNavigation,
    workspaceUrlForTab,
    workspaceUrlWithCrud,
} from "@/shared/workspace/useWorkspaceNavigation";

export function WorkspaceShell() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabs = useWorkspaceStore((s) => s.tabs);
    const activeTabId = useWorkspaceStore((s) => s.activeTabId);
    const hasHydrated = useWorkspaceStore((s) => s._hasHydrated);
    const { focusTabById, openFromHref, openRouteRecord } = useWorkspaceNavigation();
    const closeTab = useWorkspaceStore((s) => s.closeTab);
    const [mountedTabIds, setMountedTabIds] = useState<Set<string>>(() => new Set());

    useEffect(() => {
        if (activeTabId) {
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

    const showDashboard = tabs.length === 0;

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {tabs.length > 0 ? (
                <WorkspaceTabBar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onSelect={focusTabById}
                    onClose={closeTab}
                />
            ) : (
                <WorkspaceTabBarEmptyHint />
            )}

            <div className="workspace-content relative min-h-0 flex-1 overflow-hidden">
                {showDashboard && (
                    <div className="workspace-panel absolute inset-0">
                        <DashboardView />
                    </div>
                )}

                {tabs.map((tab) => {
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
