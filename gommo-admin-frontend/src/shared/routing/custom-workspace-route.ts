import type { LucideIcon } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import type { WorkspacePageLoader } from "@/shared/workspace/workspace-page.types";

export type CustomWorkspaceRouteConfig = {
    id: string;
    href: string;
    label: string;
    icon: LucideIcon;
    permission?: string;
    load: WorkspacePageLoader;
};

export function customWorkspaceRoute(config: CustomWorkspaceRouteConfig): AppRoute {
    return {
        id: config.id,
        href: config.href,
        label: config.label,
        icon: config.icon,
        permission: config.permission,
        workspaceLoader: config.load,
    };
}
