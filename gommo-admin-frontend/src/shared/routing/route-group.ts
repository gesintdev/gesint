import type { LucideIcon } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";

export type RouteGroupConfig = {
    id: string;
    label: string;
    icon: LucideIcon;
    permission?: string;
    children: AppRoute[];
};

export function routeGroup(config: RouteGroupConfig): AppRoute {
    return {
        id: config.id,
        label: config.label,
        icon: config.icon,
        permission: config.permission,
        children: config.children,
    };
}
