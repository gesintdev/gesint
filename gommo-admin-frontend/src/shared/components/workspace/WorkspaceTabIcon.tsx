"use client";

import {FileText} from "lucide-react";
import type {WorkspaceTab} from "@/shared/workspace/workspace.types";
import {findRouteById} from "@/shared/workspace/workspace-routes";

export function WorkspaceTabIcon({
    tab,
    className = "size-3.5 shrink-0",
}: {
    tab: WorkspaceTab;
    className?: string;
}) {
    const route = findRouteById(tab.routeId);
    const Icon = tab.icon ?? route?.icon ?? FileText;
    return <Icon className={className} strokeWidth={2}/>;
}
