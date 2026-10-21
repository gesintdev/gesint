import { APP_ROUTES, flattenRoutes, systemModuleGroups } from "@/config/routes";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { SystemEnumHelper } from "@/modules/root/enum/SystemEnum";
import { permissionsForSystem } from "@/shared/auth/permissions";
import { canAccessRoute } from "@/shared/auth/route-access";
import {
    isPlatformAdminWithoutTenant,
    isSystemContracted,
    resolveContractedSystems,
} from "@/shared/lib/contracted-systems";

const FLAT_ROUTES = flattenRoutes(APP_ROUTES);

export function findRouteByPathname(pathname: string): AppRoute | undefined {
    return FLAT_ROUTES.find((route) => route.href === pathname);
}

export function isPathAccessible(
    pathname: string,
    granted: readonly string[],
    contractedSystemKeys?: readonly string[] | null,
    options?: {
        tenantSlug?: string | null;
        platformAdmin?: boolean | null;
        contractedSystemKeys?: readonly string[] | null;
        systemPermissions?: Record<string, string[]> | null;
        /** Middleware pos-sessao enxuta: filtro comercial fica no bootstrap (client). */
        skipCommercialFilter?: boolean;
    },
): boolean {
    const route = findRouteByPathname(pathname);
    if (!route) return true;

    const noCommercialFilter = isPlatformAdminWithoutTenant({
        platformAdmin: options?.platformAdmin,
        tenantSlug: options?.tenantSlug,
        contractedSystemKeys: options?.contractedSystemKeys ?? contractedSystemKeys,
    });

    // Admin da plataforma no host/dev: acesso irrestrito.
    if (options?.platformAdmin && noCommercialFilter) {
        return true;
    }

    const systems = SystemEnumHelper.findSystemsForHref(pathname, systemModuleGroups);
    const systemPermissions = options?.systemPermissions;

    if (systemPermissions && systems.length > 0) {
        const allowedByScope = systems.some((system) => {
            const scoped = permissionsForSystem(granted, systemPermissions, system);
            return canAccessRoute(route, scoped);
        });
        if (!allowedByScope) {
            return false;
        }
    } else if (!canAccessRoute(route, granted)) {
        return false;
    }

    if (options?.skipCommercialFilter || noCommercialFilter) {
        return true;
    }

    const effectiveKeys = options?.contractedSystemKeys ?? contractedSystemKeys;
    // Sem keys (bootstrap ainda nao carregou / cookie enxuto): nao bloqueia no middleware.
    if (effectiveKeys == null) {
        return true;
    }

    const contracted = resolveContractedSystems(effectiveKeys);
    if (contracted == null) {
        return true;
    }
    if (systems.length === 0) {
        return true;
    }
    return systems.some((system) => isSystemContracted(system, contracted));
}
