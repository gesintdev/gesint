import type { LucideIcon } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";

export type ComingSoonRouteConfig = {
    id: string;
    href: string;
    label: string;
    icon: LucideIcon;
    permission?: string;
    title: string;
    description: string;
};

export function comingSoonRoute(config: ComingSoonRouteConfig): AppRoute {
    return {
        id: config.id,
        href: config.href,
        label: config.label,
        icon: config.icon,
        permission: config.permission,
        workspaceLoader: () =>
            import("@/shared/routing/coming-soon-workspace").then((loaded) => ({
                default: loaded.createComingSoonWorkspacePage(config.title, config.description),
            })),
    };
}
