import { Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getNavSectionsForSystem, SETTINGS_NAV_SECTIONS } from "@/config/routes";
import type { AppRoute, NavSection } from "@/modules/root/enum/ModuleEnum";
import { SystemEnum, SystemEnumHelper } from "@/modules/root/enum/SystemEnum";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

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
    "payroll-event": "payrollevent",
    payslip: "payslip",
    "payment-period": "payment",
    "payment-batch": "payment",
    "benefit-plan": "benefit",
    "benefit-enrollment": "benefitenrollment",
    tax: "tax",
    companies: "company",
};

export function resolvePermissionModule(route: AppRoute): string | null {
    const modules = resolvePermissionModules(route);
    return modules[0] ?? null;
}

/** Módulos de permissão associados a uma rota (permission / permissionsAny / mapa legado). */
export function resolvePermissionModules(route: AppRoute): string[] {
    if (route.permission) {
        const module = route.permission.split(":")[0];
        return module ? [module] : [];
    }
    if (route.permissionsAny?.length) {
        return [
            ...new Set(
                route.permissionsAny
                    .map((permission) => permission.split(":")[0])
                    .filter((module): module is string => Boolean(module)),
            ),
        ];
    }
    const mapped = ROUTE_MODULE_MAP[route.id];
    return mapped ? [mapped] : [];
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

        if (resolvePermissionModules(route).length > 0) {
            result.push(route);
        }
    }
    return result;
}

export function getPermissionNavSections(scope: SystemScope): NavSection[] {
    const sections = scope === "CFG" ? SETTINGS_NAV_SECTIONS : getNavSectionsForSystem(systemEnumFromScope(scope));
    return sections
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
        } else if (resolvePermissionModules(route).length > 0) {
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

export type SystemScope = "CFG" | "DP" | "RH" | "CONTABILIDADE";

export type SystemScopeInfos = {
    name: string;
    acronym: string;
    icon: LucideIcon;
};

const SYSTEM_SCOPE_LABELS: Record<SystemScope, string> = {
    CFG: "Configurações (CFG)",
    DP: "Departamento Pessoal (DP)",
    RH: "Recursos Humanos (RH)",
    CONTABILIDADE: "Contabilidade (CTB)",
};

const SYSTEM_SCOPE_SHORT_LABELS: Record<SystemScope, string> = {
    CFG: "CFG",
    DP: "DP",
    RH: "RH",
    CONTABILIDADE: "CTB",
};

export function systemScopeFromEnum(system: SystemEnum): SystemScope {
    if (system === SystemEnum.DP) return "DP";
    if (system === SystemEnum.CONTABILIDADE) return "CONTABILIDADE";
    return "RH";
}

export function systemEnumFromScope(scope: SystemScope): SystemEnum {
    if (scope === "DP") return SystemEnum.DP;
    if (scope === "CONTABILIDADE") return SystemEnum.CONTABILIDADE;
    return SystemEnum.RH;
}

/** Escopos atribuíveis a perfis/usuários: CFG + sistemas de domínio do rail. */
export const ASSIGNABLE_SYSTEM_SCOPES: SystemScope[] = [
    "CFG",
    ...SystemEnumHelper.getSortedSystems().map(systemScopeFromEnum),
];

export function systemScopeLabel(scope: SystemScope): string {
    return SYSTEM_SCOPE_LABELS[scope];
}

export function systemScopeShortLabel(scope: SystemScope): string {
    return SYSTEM_SCOPE_SHORT_LABELS[scope];
}

export function systemScopeInfos(scope: SystemScope): SystemScopeInfos {
    if (scope === "CFG") {
        return {
            name: "Configurações",
            acronym: "CFG",
            icon: Settings,
        };
    }
    const infos = SystemEnumHelper.getById(systemEnumFromScope(scope));
    return {
        name: infos.name,
        acronym: infos.acronym,
        icon: infos.icon,
    };
}

export function assignableSystemSelectItems(): SelectItem[] {
    return ASSIGNABLE_SYSTEM_SCOPES.map((scope) => ({
        value: scope,
        label: systemScopeLabel(scope),
    }));
}

export function assignableSystemFilterItems(): Array<{ value: SystemScope | "ALL"; label: string }> {
    return [
        { value: "ALL", label: "Todos" },
        ...ASSIGNABLE_SYSTEM_SCOPES.map((scope) => ({
            value: scope as SystemScope | "ALL",
            label: systemScopeShortLabel(scope),
        })),
    ];
}

export function routeHasMarkedPermissions(route: AppRoute, markedModules: ReadonlySet<string>): boolean {
    if (route.children?.length) {
        return route.children.some((child) => routeHasMarkedPermissions(child, markedModules));
    }
    return resolvePermissionModules(route).some((permissionModule) => markedModules.has(permissionModule));
}

export function collectMarkedRouteIds(sections: NavSection[], markedModules: ReadonlySet<string>): Set<string> {
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
            if (resolvePermissionModules(route).some((permissionModule) => markedModules.has(permissionModule))) {
                ids.add(route.id);
            }
        }
    };
    for (const section of sections) {
        walk(section.routes);
    }
    return ids;
}
