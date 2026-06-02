import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { deriveWritePermission, hasPermission } from "@/shared/auth/permissions";

/**
 * Route access without a profile permission.
 * - full: navigation and write actions for any authenticated user.
 * - readonly: navigation and listing only.
 */
export type RoutePublicAccess = "full" | "readonly";

export type RouteAccessSource = Pick<AppRoute, "permission" | "publicAccess">;

/** Any authenticated user (e.g. dashboard). */
export const ROUTE_PUBLIC_FULL = { publicAccess: "full" as const satisfies RoutePublicAccess };

/** Read-only route without a database permission. */
export const ROUTE_PUBLIC_READONLY = {
    publicAccess: "readonly" as const satisfies RoutePublicAccess,
};

/** User can open the route (menu, guard, tabs). */
export function canAccessRoute(
    route: RouteAccessSource | undefined,
    granted: readonly string[],
): boolean {
    if (!route) return false;
    if (route.publicAccess) return true;
    if (!route.permission) return false;
    return hasPermission(granted, route.permission);
}

/** User can create/update/delete on the route. */
export function canWriteRoute(
    route: RouteAccessSource | undefined,
    granted: readonly string[],
    explicitWritePermission?: string,
): boolean {
    if (!route) return false;
    if (route.publicAccess === "full") return true;
    if (route.publicAccess === "readonly") return false;
    const write = explicitWritePermission ?? deriveWritePermission(route.permission);
    return hasPermission(granted, write);
}

/** Extra tabs without permission/publicAccess stay hidden. */
export function canAccessExtraTab(
    tab: { permission?: string; publicAccess?: RoutePublicAccess },
    granted: readonly string[],
): boolean {
    return canAccessRoute(tab, granted);
}
