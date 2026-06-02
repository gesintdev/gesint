import { APP_ROUTES, flattenRoutes } from "@/config/routes";
import { canAccessRoute } from "@/shared/auth/route-access";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";

const FLAT_ROUTES = flattenRoutes(APP_ROUTES);

export function findRouteByPathname(pathname: string): AppRoute | undefined {
    return FLAT_ROUTES.find((route) => route.href === pathname);
}

/**
 * Registered routes without permission/publicAccess require profile access.
 * Unknown pathnames are not filtered here.
 */
export function isPathAccessible(pathname: string, granted: readonly string[]): boolean {
    const route = findRouteByPathname(pathname);
    if (!route) return true;
    return canAccessRoute(route, granted);
}
