import type {LucideIcon} from "lucide-react";
import type {WorkspaceEntityKey} from "@/shared/workspace/workspace-tab-id";

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

function tabBaseLabel(tab: WorkspaceTab): string {
    return (tab.shortLabel || tab.routeLabel).trim();
}

function appendTabTitleSuffix(base: string, suffix?: string): string {
    const normalizedBase = base.trim();
    const normalizedSuffix = suffix?.trim();
    if (!normalizedSuffix) return normalizedBase;
    if (normalizedSuffix.toLowerCase() === normalizedBase.toLowerCase()) return normalizedBase;
    return `${normalizedBase} - ${normalizedSuffix}`;
}

export function formatWorkspaceTabTitle(tab: WorkspaceTab): string {
    const base = tabBaseLabel(tab);
    if (tab.entityKey === "list") {
        return appendTabTitleSuffix(base, tab.titleSuffix);
    }
    if (tab.entityKey === "new") {
        return appendTabTitleSuffix(base, tab.titleSuffix ?? "Novo");
    }
    return appendTabTitleSuffix(base, tab.titleSuffix);
}
