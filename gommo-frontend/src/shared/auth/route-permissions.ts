import { APP_ROUTES, flattenRoutes, systemModuleGroups } from "@/config/routes";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { SystemEnumHelper } from "@/modules/root/enum/SystemEnum";
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

    if (!canAccessRoute(route, granted)) {
        return false;
    }

    // Localhost / schema public: permissões ok; não aplica filtro comercial de sistemas.
    if (noCommercialFilter) {
        return true;
    }

    const hasTenant = Boolean(options?.tenantSlug?.trim());
    // Tenant com JWT antigo (sem keys): libera so paths neutros ate hidratar no cliente.
    if (hasTenant && contractedSystemKeys == null) {
        const systems = SystemEnumHelper.findSystemsForHref(pathname, systemModuleGroups);
        return systems.length === 0;
    }

    const contracted = resolveContractedSystems(contractedSystemKeys);
    if (contracted == null) {
        return true;
    }
    const systems = SystemEnumHelper.findSystemsForHref(pathname, systemModuleGroups);
    if (systems.length === 0) {
        return true;
    }
    return systems.some((system) => isSystemContracted(system, contracted));
}
