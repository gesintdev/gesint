import type { LucideIcon } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import type { RoutePublicAccess } from "@/shared/auth/route-access";

export type ComingSoonRouteConfig = {
    id: string;
    href: string;
    label: string;
    icon: LucideIcon;
    permission?: string;
    publicAccess?: RoutePublicAccess;
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
        publicAccess: config.publicAccess,
        workspaceLoader: () =>
            import("@/shared/routing/coming-soon-workspace").then((loaded) => ({
                default: loaded.createComingSoonWorkspacePage(config.title, config.description),
            })),
    };
}
