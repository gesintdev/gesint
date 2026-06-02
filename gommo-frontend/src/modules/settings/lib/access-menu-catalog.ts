import type { AppRoute, NavSection } from "@/modules/root/enum/ModuleEnum";
import { getNavSectionsForSystem } from "@/config/routes";
import { SystemEnum } from "@/modules/root/enum/SystemEnum";

const ROUTE_MODULE_MAP: Record<string, string> = {
    departments: "department",
    "job-positions": "jobposition",
    users: "user",
    roles: "role",
    permissions: "role",
    "collaborator-admission": "admission",
    "collaborator-people": "collaborator",
    performance: "performance",
    offboarding: "offboarding",
    "exit-interview": "exitinterview",
    attendance: "attendance",
    leave: "leave",
    "leave-absence": "leave",
    "leave-vacation": "leave",
    "payroll-run": "payroll",
    payslip: "payslip",
    "benefit-plan": "benefit",
    "benefit-enrollment": "benefitenrollment",
    tax: "tax",
    companies: "company",
};

export function resolvePermissionModule(route: AppRoute): string | null {
    if (route.permission) {
        return route.permission.split(":")[0] ?? null;
    }
    return ROUTE_MODULE_MAP[route.id] ?? null;
}

function filterPermissionRoutes(routes: AppRoute[]): AppRoute[] {
    const result: AppRoute[] = [];
    for (const route of routes) {
        if (route.children?.length) {
            const children = filterPermissionRoutes(route.children);
            if (children.length > 0) {
                result.push({ ...route, children });
            }
            continue;
        }
        if (resolvePermissionModule(route)) {
            result.push(route);
        }
    }
    return result;
}

/** Mesmas seções/rotas do sidebar, omitindo telas sem módulo de permissão. */
export function getPermissionNavSections(system: SystemEnum): NavSection[] {
    return getNavSectionsForSystem(system)
        .map((section) => ({
            ...section,
            routes: filterPermissionRoutes(section.routes),
        }))
        .filter((section) => section.routes.length > 0);
}

export function findFirstPermissionRoute(sections: NavSection[]): AppRoute | null {
    for (const section of sections) {
        const route = findFirstInRoutes(section.routes);
        if (route) return route;
    }
    return null;
}

function findFirstInRoutes(routes: AppRoute[]): AppRoute | null {
    for (const route of routes) {
        if (route.children?.length) {
            const nested = findFirstInRoutes(route.children);
            if (nested) return nested;
        } else if (resolvePermissionModule(route)) {
            return route;
        }
    }
    return null;
}

export function parentGroupIdsForRoute(sections: NavSection[], routeId: string): string[] {
    for (const section of sections) {
        const parents = findParentIds(section.routes, routeId, []);
        if (parents) return parents;
    }
    return [];
}

function findParentIds(routes: AppRoute[], routeId: string, ancestors: string[]): string[] | null {
    for (const route of routes) {
        if (route.id === routeId) {
            return ancestors;
        }
        if (route.children?.length) {
            const nested = findParentIds(route.children, routeId, [...ancestors, route.id]);
            if (nested) return nested;
        }
    }
    return null;
}

export type SystemScope = "DP" | "RH";

export function systemScopeFromEnum(system: SystemEnum): SystemScope {
    return system === SystemEnum.DP ? "DP" : "RH";
}

export function systemEnumFromScope(scope: SystemScope): SystemEnum {
    return scope === "DP" ? SystemEnum.DP : SystemEnum.RH;
}

export function routeHasMarkedPermissions(route: AppRoute, markedModules: ReadonlySet<string>): boolean {
    if (route.children?.length) {
        return route.children.some((child) => routeHasMarkedPermissions(child, markedModules));
    }
    const permissionModule = resolvePermissionModule(route);
    return permissionModule != null && markedModules.has(permissionModule);
}

export function collectMarkedRouteIds(
    sections: NavSection[],
    markedModules: ReadonlySet<string>,
): Set<string> {
    const ids = new Set<string>();

    const walk = (routes: AppRoute[]) => {
        for (const route of routes) {
            if (route.children?.length) {
                walk(route.children);
                if (routeHasMarkedPermissions(route, markedModules)) {
                    ids.add(route.id);
                }
                continue;
            }
            const permissionModule = resolvePermissionModule(route);
            if (permissionModule && markedModules.has(permissionModule)) {
                ids.add(route.id);
            }
        }
    };

    for (const section of sections) {
        walk(section.routes);
    }

    return ids;
}
