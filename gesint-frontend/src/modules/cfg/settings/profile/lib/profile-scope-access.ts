import {
    ASSIGNABLE_SYSTEM_SCOPES,
    getPermissionNavSections,
    systemEnumFromScope,
    type SystemScope,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type { AppRoute, NavSection } from "@/modules/root/enum/ModuleEnum";
import type { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { canAccessRoute } from "@/shared/auth/route-access";
import { isSystemContracted } from "@/shared/lib/contracted-systems";

/**
 * CFG nao e produto comercial: nunca depende de contrato.
 * DP/RH/CTB so aparecem quando o cliente contratou o sistema.
 */
function isScopeContracted(scope: SystemScope, contractedSystems: Set<SystemEnum> | null): boolean {
    if (scope === "CFG") return true;
    return isSystemContracted(systemEnumFromScope(scope), contractedSystems);
}

/** Menus do sistema que o usuario logado consegue acessar. */
export function filterNavSectionsByPermission(
    sections: NavSection[],
    granted: readonly string[],
    unrestricted: boolean,
): NavSection[] {
    if (unrestricted) return sections;

    const filterRoutes = (routes: AppRoute[]): AppRoute[] => {
        const result: AppRoute[] = [];
        for (const route of routes) {
            if (route.children?.length) {
                const children = filterRoutes(route.children);
                if (children.length > 0) {
                    result.push({ ...route, children });
                }
                continue;
            }
            if (canAccessRoute(route, granted)) {
                result.push(route);
            }
        }
        return result;
    };

    return sections
        .map((section) => ({ ...section, routes: filterRoutes(section.routes) }))
        .filter((section) => section.routes.length > 0);
}

/**
 * Sistemas atribuiveis a perfis:
 * 1. apenas sistemas contratados pelo cliente;
 * 2. destes, apenas os que o usuario logado consegue acessar (admin global mantem todos).
 */
export function resolveAssignableScopes(
    contractedSystems: Set<SystemEnum> | null,
    granted: readonly string[],
    unrestricted: boolean,
): SystemScope[] {
    return ASSIGNABLE_SYSTEM_SCOPES.filter((scope) => {
        if (!isScopeContracted(scope, contractedSystems)) return false;
        if (unrestricted) return true;
        return filterNavSectionsByPermission(getPermissionNavSections(scope), granted, false).length > 0;
    });
}
