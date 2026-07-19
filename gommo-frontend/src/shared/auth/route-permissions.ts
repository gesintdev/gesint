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

    // Admin da plataforma (localhost / dev-public): acesso a todos os sistemas/rotas.
    if (
        isPlatformAdminWithoutTenant({
            platformAdmin: options?.platformAdmin,
            tenantSlug: options?.tenantSlug,
            contractedSystemKeys: options?.contractedSystemKeys ?? contractedSystemKeys,
        })
    ) {
        return true;
    }

    if (!canAccessRoute(route, granted)) {
        return false;
    }

    const hasTenant = Boolean(options?.tenantSlug?.trim());
    // Tenant com JWT antigo (sem keys): libera so paths neutros ate hidratar no cliente.
    if (hasTenant && contractedSystemKeys == null) {
        const system = SystemEnumHelper.getSystemForHref(pathname, systemModuleGroups);
        return system == null;
    }

    const contracted = resolveContractedSystems(contractedSystemKeys);
    if (contracted == null) {
        return true;
    }
    const system = SystemEnumHelper.getSystemForHref(pathname, systemModuleGroups);
    return isSystemContracted(system, contracted);
}
