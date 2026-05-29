import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import type { TabbedCrudRouteConfig } from "@/shared/routing/tabbed-crud-route.types";

export function tabbedCrudRoute(config: TabbedCrudRouteConfig): AppRoute {
    return {
        id: config.id,
        href: config.href,
        label: config.label,
        icon: config.icon,
        permission: config.permission,
        workspaceLoader: () =>
            import("@/shared/routing/tabbed-crud-workspace").then((module) => ({
                default: module.createTabbedCrudWorkspacePage(config),
            })),
    };
}
