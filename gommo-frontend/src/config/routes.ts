import { settingsModule } from "@/modules/cfg/settings/settings.module";
import { payrollModule } from "@/modules/ctb/payroll/payroll.module";
import { organizationModule } from "@/modules/dp/organization/organization.module";
import { paymentsModule } from "@/modules/dp/payment/payment.module";
import { dashboardModule } from "@/modules/rh/dashboard/dashboard.module";
import { insightsModule } from "@/modules/rh/insights/insights.module";
import { personModule } from "@/modules/rh/person/person.module";
import type { AppRoute, NavSection } from "@/modules/root/enum/ModuleEnum";
import { ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";
import { SystemEnum, type TSystemModuleGroup } from "@/modules/root/enum/SystemEnum";
/**
 * routes.ts - ponto de entrada de navegacao do sistema.
 *
 * Arquitetura (sem dependencia circular):
 *   *.routes.ts -> *.module.ts -> ModuleEnum.ts
 *   routes.ts importa dos module files, agrupa por SystemEnum, nunca o contrario.
 *
 * Para adicionar um novo modulo:
 *   1. config/<name>.routes.ts — UNICO arquivo: menu + tela (tabbedCrudRoute / customWorkspaceRoute)
 *   2. <name>.module.ts — infos + routes
 *   3. ModuleEnum + registry
 *   4. Inclua em `systemModuleGroups` no domínio correto (DP / RH)
 */
// Re-exporta tipos centrais (mantem compatibilidade com imports existentes)
export type { AppRoute, NavSection, TModule, TModuleInfos } from "@/modules/root/enum/ModuleEnum";
export { ModuleEnum, ModuleEnumHelper } from "@/modules/root/enum/ModuleEnum";
export type { TSystemModuleGroup } from "@/modules/root/enum/SystemEnum";
export { SystemEnum, SystemEnumHelper } from "@/modules/root/enum/SystemEnum";

export const systemModuleGroups: TSystemModuleGroup[] = [
    {
        system: SystemEnum.DP,
        modules: [organizationModule, paymentsModule],
    },
    {
        system: SystemEnum.RH,
        modules: [dashboardModule, personModule, insightsModule],
    },
    {
        system: SystemEnum.CONTABILIDADE,
        modules: [payrollModule],
    },
];
/** Módulo de configurações (rail inferior — perfis e usuários). */
export const SETTINGS_NAV_SECTIONS = ModuleEnumHelper.toNavSections([settingsModule]);
/** Todos os módulos registrados (workspace, permissões, etc.) */
export const modules: TModule[] = [...systemModuleGroups.flatMap((g) => g.modules), settingsModule];
/** Seções de todos os domínios (breadcrumbs, busca global) */
export const ALL_NAV_SECTIONS: NavSection[] = ModuleEnumHelper.toNavSections(modules);

export function getNavSectionsForSystem(system: SystemEnum): NavSection[] {
    const group = systemModuleGroups.find((g) => g.system === system);
    if (!group) return [];
    return ModuleEnumHelper.toNavSections(group.modules);
}

export const NAV_SECTIONS = getNavSectionsForSystem(SystemEnum.DP);
/** Lista plana de todas as rotas (busca global, breadcrumbs, etc.) */
export const APP_ROUTES = ALL_NAV_SECTIONS.flatMap((s) => s.routes);

export { type BreadcrumbItem, getBreadcrumbs } from "@/config/breadcrumbs";

export function flattenRoutes(routes: AppRoute[], parentLabel = ""): Array<AppRoute & { searchLabel: string }> {
    const result: Array<AppRoute & { searchLabel: string }> = [];
    for (const route of routes) {
        const searchLabel = parentLabel ? `${parentLabel} > ${route.label}` : route.label;
        result.push({ ...route, searchLabel });
        if (route.children) {
            result.push(...flattenRoutes(route.children, route.label));
        }
    }
    return result;
}
