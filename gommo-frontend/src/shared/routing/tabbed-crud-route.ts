import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import type { TabbedCrudRouteConfig } from "@/shared/routing/tabbed-crud-route.types";
import { resolveLazyComponent } from "@/shared/routing/resolve-lazy-component";

export function tabbedCrudRoute(config: TabbedCrudRouteConfig): AppRoute {
    return {
        id: config.id,
        href: config.href,
        label: config.label,
        icon: config.icon,
        permission: config.permission,
        publicAccess: config.publicAccess,
        tabShortLabel: config.tabShortLabel,
        workspaceLoader: config.workspace
            ? () =>
                  resolveLazyComponent(config.workspace!).then((defaultExport) => ({
                      default: defaultExport,
                  }))
            : () =>
                  import("@/shared/routing/tabbed-crud-workspace").then((loaded) => ({
                      default: loaded.createTabbedCrudWorkspacePage(config),
                  })),
    };
}
