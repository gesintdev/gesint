"use client";
import { findRouteByHref } from "@/shared/workspace/workspace-routes";

export { workspaceUrl, workspaceUrlForTab, workspaceUrlWithCrud } from "@/shared/workspace/workspace-navigation-url";

export { useWorkspaceLocation, useWorkspaceNavigation } from "@/shared/workspace/WorkspaceNavigationProvider";

export type WorkspaceCrudLocation = {
    href: string;
    editingId: string | null;
    isNew: boolean;
};

export function parseWorkspaceLocation(pathname: string, search: string): WorkspaceCrudLocation | null {
    const route = findRouteByHref(pathname);
    if (!route) return null;
    const params = new URLSearchParams(search);
    const edit = params.get("edit");
    return {
        href: pathname,
        editingId: edit,
        isNew: params.has("new"),
    };
}
