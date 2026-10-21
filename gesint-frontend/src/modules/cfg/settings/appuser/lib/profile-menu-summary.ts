import {
    getPermissionNavSections,
    resolvePermissionModule,
    type SystemScope,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type { PermissionSummary } from "@/modules/cfg/settings/profile/dto/profile.dto";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";

const ACTION_LABELS: Record<string, string> = {
    read: "Consultar",
    write: "Criar / editar",
    delete: "Excluir",
    picker: "Seleção",
};

export function permissionActionLabel(authority: string): string {
    const action = authority.split(":")[1] ?? authority;
    return ACTION_LABELS[action] ?? action;
}

export type ProfileMenuSummary = {
    menuLabel: string;
    permissions: string[];
};

function buildModuleToMenuLabels(system: SystemScope): Map<string, string[]> {
    const map = new Map<string, Set<string>>();
    const add = (module: string, label: string) => {
        if (!map.has(module)) map.set(module, new Set());
        map.get(module)!.add(label);
    };
    const walk = (routes: AppRoute[]) => {
        for (const route of routes) {
            if (route.children?.length) {
                walk(route.children);
                continue;
            }
            const permissionModule = resolvePermissionModule(route);
            if (permissionModule) add(permissionModule, route.label);
        }
    };
    for (const section of getPermissionNavSections(system)) {
        walk(section.routes);
    }
    return new Map(Array.from(map.entries()).map(([module, labels]) => [module, Array.from(labels).sort()]));
}

export function summarizeProfileMenus(
    permissions: PermissionSummary[] | undefined,
    system: SystemScope,
): ProfileMenuSummary[] {
    const moduleToMenus = buildModuleToMenuLabels(system);
    const byMenu = new Map<string, Set<string>>();
    for (const permission of permissions ?? []) {
        const menus = moduleToMenus.get(permission.module) ?? [permission.module];
        const actionLabel = permissionActionLabel(permission.authority);
        for (const menuLabel of menus) {
            if (!byMenu.has(menuLabel)) byMenu.set(menuLabel, new Set());
            byMenu.get(menuLabel)!.add(actionLabel);
        }
    }
    return Array.from(byMenu.entries())
        .map(([menuLabel, actions]) => ({
            menuLabel,
            permissions: Array.from(actions).sort(),
        }))
        .sort((a, b) => a.menuLabel.localeCompare(b.menuLabel, "pt-BR"));
}
