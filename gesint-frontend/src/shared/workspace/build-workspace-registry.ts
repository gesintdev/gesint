"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { AppRoute, TModule } from "@/modules/root/enum/ModuleEnum";
import type { WorkspacePageEntry } from "@/shared/workspace/workspace-page.types";

function flattenRoutable(routes: readonly AppRoute[]): AppRoute[] {
    const result: AppRoute[] = [];
    for (const route of routes) {
        if (route.href) {
            result.push(route);
        }

        if (route.children?.length) {
            result.push(...flattenRoutable(route.children));
        }
    }
    return result;
}

export function collectWorkspacePages(modules: readonly TModule[]): WorkspacePageEntry[] {
    const entries: WorkspacePageEntry[] = [];
    const seen = new Set<string>();
    for (const mod of modules) {
        for (const route of flattenRoutable(mod.routes)) {
            const loader = route.workspaceLoader;
            if (!route.href || !loader) {
                continue;
            }

            // Mesmo href em RH e DP (ex.: colaboradores) é intencional: first-wins.
            if (seen.has(route.href)) {
                continue;
            }
            seen.add(route.href);
            entries.push({
                href: route.href,
                Component: dynamic(loader, { ssr: false }) as ComponentType,
            });
        }
    }
    return entries;
}

export function createWorkspacePageLookup(entries: readonly WorkspacePageEntry[]): Map<string, ComponentType> {
    return new Map(entries.map((entry) => [entry.href, entry.Component]));
}
