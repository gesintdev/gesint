import type { LucideIcon } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import type { RoutePublicAccess } from "@/shared/auth/route-access";

export type RouteGroupConfig = {
    id: string;
    label: string;
    icon: LucideIcon;
    permission?: string;
    publicAccess?: RoutePublicAccess;
    children: AppRoute[];
};

export function routeGroup(config: RouteGroupConfig): AppRoute {
    return {
        id: config.id,
        label: config.label,
        icon: config.icon,
        permission: config.permission,
        publicAccess: config.publicAccess,
        children: config.children,
    };
}
