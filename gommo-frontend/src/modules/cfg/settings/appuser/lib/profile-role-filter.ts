import {
    getPermissionNavSections,
    resolvePermissionModule,
    systemEnumFromScope,
    type SystemScope,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type { Profile } from "@/modules/cfg/settings/profile/dto/profile.dto";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
function collectLeafModules(routes: AppRoute[], modules: Set<string>) {
    for (const route of routes) {
        if (route.children?.length) {
            collectLeafModules(route.children, modules);
            continue;
        }
        const permissionModule = resolvePermissionModule(route);
        if (permissionModule) modules.add(permissionModule);
    }
}

function collectModulesForRoute(route: AppRoute, modules: Set<string>) {
    if (route.children?.length) {
        collectLeafModules(route.children, modules);
        return;
    }
    const permissionModule = resolvePermissionModule(route);
    if (permissionModule) modules.add(permissionModule);
}

function walkRoutes(routes: AppRoute[], query: string, modules: Set<string>) {
    for (const route of routes) {
        if (route.label.toLowerCase().includes(query)) {
            collectModulesForRoute(route, modules);
        }

        if (route.children?.length) {
            walkRoutes(route.children, query, modules);
        }
    }
}

export function permissionModulesMatchingMenuQuery(system: SystemScope, query: string): Set<string> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return new Set();
    const modules = new Set<string>();
    const sections = getPermissionNavSections(systemEnumFromScope(system));
    for (const section of sections) {
        if (section.label.toLowerCase().includes(normalized)) {
            collectLeafModules(section.routes, modules);
        }
        walkRoutes(section.routes, normalized, modules);
    }
    return modules;
}

export function filterProfilesBySearch(profiles: Profile[], query: string, system: SystemScope): Profile[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return profiles;
    const menuModules = permissionModulesMatchingMenuQuery(system, normalized);
    return profiles.filter((profile) => {
        if (profile.name.toLowerCase().includes(normalized)) return true;
        if (profile.description?.toLowerCase().includes(normalized)) return true;
        if (menuModules.size > 0 && profile.permissions?.some((permission) => menuModules.has(permission.module))) {
            return true;
        }
        return false;
    });
}
