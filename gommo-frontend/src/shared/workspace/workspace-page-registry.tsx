"use client";

import type { ComponentType } from "react";

import { modules } from "@/config/routes";
import { collectWorkspacePages, createWorkspacePageLookup } from "@/shared/workspace/build-workspace-registry";

export type { WorkspacePageEntry } from "@/shared/workspace/workspace-page.types";

const WORKSPACE_PAGES = collectWorkspacePages(modules);
const REGISTRY_BY_HREF = createWorkspacePageLookup(WORKSPACE_PAGES);
/** Lista agregada a partir dos módulos registrados em `config/routes.ts`. */
export const WORKSPACE_PAGE_REGISTRY = WORKSPACE_PAGES;

export function getWorkspacePageComponent(href: string): ComponentType | undefined {
    return REGISTRY_BY_HREF.get(href);
}
