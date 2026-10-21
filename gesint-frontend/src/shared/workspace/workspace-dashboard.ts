import type { WorkspaceTab } from "@/shared/workspace/workspace.types";
import { buildWorkspaceTabId } from "@/shared/workspace/workspace-tab-id";

export const DASHBOARD_ROUTE_ID = "dashboard";
export const DASHBOARD_HREF = "/dashboard";
export const DASHBOARD_TAB_ID = buildWorkspaceTabId(DASHBOARD_ROUTE_ID, "list");

export function isDashboardTabId(tabId: string | null | undefined): boolean {
    return tabId === DASHBOARD_TAB_ID;
}

export function isWorkspaceDashboardTab(tab: Pick<WorkspaceTab, "id" | "routeId" | "entityKey">): boolean {
    return isDashboardTabId(tab.id) || (tab.routeId === DASHBOARD_ROUTE_ID && tab.entityKey === "list");
}

export function stripDashboardTabs(tabs: readonly WorkspaceTab[]): WorkspaceTab[] {
    return tabs.filter((tab) => !isWorkspaceDashboardTab(tab));
}
