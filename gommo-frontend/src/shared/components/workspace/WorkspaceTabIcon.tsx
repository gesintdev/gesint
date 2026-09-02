"use client";

import { FileText } from "lucide-react";

import type { WorkspaceTab } from "@/shared/workspace/workspace.types";
import { findRouteById } from "@/shared/workspace/workspace-routes";

function resolveTabIcon(tab: WorkspaceTab) {
    if (typeof tab.icon === "function") {
        return tab.icon;
    }
    const route = findRouteById(tab.routeId);
    return route?.icon ?? FileText;
}

export function WorkspaceTabIcon({ tab, className = "size-3.5 shrink-0" }: { tab: WorkspaceTab; className?: string }) {
    const Icon = resolveTabIcon(tab);

    return <Icon className={className} strokeWidth={2} />;
}
