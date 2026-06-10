import { APP_ROUTES, flattenRoutes } from "@/config/routes";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { canAccessRoute } from "@/shared/auth/route-access";

const FLAT_ROUTES = flattenRoutes(APP_ROUTES);

export function findRouteByPathname(pathname: string): AppRoute | undefined {
    return FLAT_ROUTES.find((route) => route.href === pathname);
}

export function isPathAccessible(pathname: string, granted: readonly string[]): boolean {
    const route = findRouteByPathname(pathname);
    if (!route) return true;
    return canAccessRoute(route, granted);
}
