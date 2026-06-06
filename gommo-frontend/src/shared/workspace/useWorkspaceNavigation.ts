"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AppRoute } from "@/config/routes";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { defaultShortLabel, findRouteByHref } from "@/shared/workspace/workspace-routes";
import { buildWorkspaceTabId, parseWorkspaceTabId } from "@/shared/workspace/workspace-tab-id";
import { replaceUrlIfNeeded } from "@/shared/workspace/workspace-location";

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

export function workspaceUrl(href: string): string {
    return href;
}

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

export function workspaceUrlWithCrud(
    href: string,
    crud: { editingId?: string | null; isNew?: boolean },
): string {
    if (crud.editingId) return `${href}?edit=${encodeURIComponent(crud.editingId)}`;
    if (crud.isNew) return `${href}?new=1`;
    return href;
}

export function workspaceUrlForTab(href: string, tabId: string): string {
    const { entityKey } = parseWorkspaceTabId(tabId);
    if (entityKey === "new") return workspaceUrlWithCrud(href, { isNew: true });
    if (entityKey !== "list") return workspaceUrlWithCrud(href, { editingId: entityKey });
    return workspaceUrl(href);
}

export function useWorkspaceNavigation() {
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
        (
            route: AppRoute,
            entityId: string,
            options?: { titleSuffix?: string; shortLabel?: string },
        ) => {
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
            const tab = useWorkspaceStore.getState().tabs.find((t) => t.id === tabId);
            if (!tab) return;
            focusTab(tabId);
            const { entityKey } = parseWorkspaceTabId(tabId);
            if (entityKey === "list") syncUrl(tab.href);
            else if (entityKey === "new") syncUrl(tab.href, { isNew: true });
            else syncUrl(tab.href, { editingId: entityKey });
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

    return {
        openRouteModule,
        openRouteRecord,
        openRouteCreate,
        openFromHref,
        focusTabById,
        syncCrudUrl,
    };
}
