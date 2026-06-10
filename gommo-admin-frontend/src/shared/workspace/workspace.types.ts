import type { LucideIcon } from "lucide-react";
import type { WorkspaceEntityKey } from "@/shared/workspace/workspace-tab-id";

export type WorkspaceTab = {
    id: string;
    routeId: string;
    href: string;
    routeLabel: string;
    shortLabel: string;
    entityKey: WorkspaceEntityKey;
    titleSuffix?: string;
    icon?: LucideIcon;
};

export type OpenWorkspaceTabInput = {
    routeId: string;
    href: string;
    routeLabel: string;
    shortLabel?: string;
    icon?: LucideIcon;
    titleSuffix?: string;
};

export type OpenWorkspaceRecordInput = OpenWorkspaceTabInput & {
    entityKey: WorkspaceEntityKey;
};

export function formatWorkspaceTabTitle(tab: WorkspaceTab): string {
    if (tab.entityKey === "list") return tab.shortLabel || tab.routeLabel;
    if (tab.entityKey === "new") {
        return tab.titleSuffix ? `${tab.shortLabel} - ${tab.titleSuffix}` : `${tab.shortLabel} - Novo`;
    }

    if (tab.titleSuffix) return `${tab.shortLabel} - ${tab.titleSuffix}`;
    return tab.shortLabel;
}
