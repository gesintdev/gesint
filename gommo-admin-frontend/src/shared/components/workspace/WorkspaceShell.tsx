"use client";

import clsx from "clsx";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useRef} from "react";
import {WorkspaceTabBar, WorkspaceTabBarEmptyHint} from "@/shared/components/workspace/WorkspaceTabBar";
import {DashboardView} from "@/shared/workspace/views/DashboardView";
import {WorkspaceTabProvider} from "@/shared/workspace/WorkspaceTabContext";
import {getWorkspacePageComponent} from "@/shared/workspace/workspace-page-registry";
import {useWorkspaceStore} from "@/shared/workspace/workspace.store";
import {findRouteByHref} from "@/shared/workspace/workspace-routes";
import {buildWorkspaceTabId} from "@/shared/workspace/workspace-tab-id";
import {
    parseWorkspaceLocation,
    useWorkspaceNavigation,
    workspaceUrl,
    workspaceUrlWithCrud,
} from "@/shared/workspace/useWorkspaceNavigation";

export function WorkspaceShell() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabs = useWorkspaceStore((s) => s.tabs);
    const activeTabId = useWorkspaceStore((s) => s.activeTabId);
    const hasHydrated = useWorkspaceStore((s) => s._hasHydrated);
    const {focusTabById, openFromHref, openRouteRecord} = useWorkspaceNavigation();
    const closeTab = useWorkspaceStore((s) => s.closeTab);
    const initialUrlHandled = useRef(false);

    useEffect(() => {
        if (!hasHydrated || initialUrlHandled.current) return;
        initialUrlHandled.current = true;

        const state = useWorkspaceStore.getState();
        if (state.tabs.length > 0 && state.activeTabId) {
            const active = state.tabs.find((t) => t.id === state.activeTabId);
            if (active) {
                router.replace(workspaceUrl(active.href), {scroll: false});
                return;
            }
        }

        const parsed = parseWorkspaceLocation(pathname, searchParams.toString());
        if (!parsed) return;

        const route = findRouteByHref(parsed.href);
        if (!route) return;

        if (parsed.editingId) {
            openRouteRecord(route, parsed.editingId);
            return;
        }

        const listTabId = buildWorkspaceTabId(route.id, "list");
        const existingList = state.tabs.find((t) => t.id === listTabId);

        if (existingList) {
            focusTabById(existingList.id);
            if (parsed.isNew) {
                router.replace(workspaceUrlWithCrud(parsed.href, {isNew: true}), {scroll: false});
            }
            return;
        }

        openFromHref(parsed.href);
        if (parsed.isNew) {
            router.replace(workspaceUrlWithCrud(parsed.href, {isNew: true}), {scroll: false});
        }
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
                <WorkspaceTabBarEmptyHint/>
            )}

            <div className="workspace-content relative min-h-0 flex-1 overflow-hidden">
                {showDashboard && (
                    <div className="workspace-panel absolute inset-0">
                        <DashboardView/>
                    </div>
                )}

                {tabs.map((tab) => {
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
                                <Page/>
                            </WorkspaceTabProvider>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
