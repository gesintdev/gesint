/**
 * routes.ts - ponto de entrada de navegacao do sistema.
 *
 * Arquitetura (sem dependencia circular):
 *   *.routes.ts -> *.module.ts -> ModuleEnum.ts
 *   routes.ts importa dos module files, nunca o contrario.
 *
 * Para adicionar um novo modulo:
 *   1. config/<name>.routes.ts — UNICO arquivo: menu + tela (tabbedCrudRoute / customWorkspaceRoute)
 *   2. <name>.module.ts — infos + routes
 *   3. ModuleEnum + registry
 *   4. Inclua em `modules` abaixo
 */

// Re-exporta tipos centrais (mantem compatibilidade com imports existentes)
export type { AppRoute, NavSection, TModule, TModuleInfos } from "@/modules/root/enum/ModuleEnum";
export { ModuleEnum, ModuleEnumHelper } from "@/modules/root/enum/ModuleEnum";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";
import { dashboardModule }      from "@/modules/dashboard/dashboard.module";
import { organizationModule }   from "@/modules/organization/organization.module";
import { collaboratorModule }   from "@/modules/collaborator/collaborator.module";
import { payrollModule }        from "@/modules/payroll/payroll.module";
import { insightsModule }       from "@/modules/insights/insights.module";

// -------------------------------------------------------
// Fonte de verdade: registre todos os modulos aqui.
// A ordem de exibicao no sidebar e controlada por
// TModuleInfos.order definido no registry de ModuleEnum.ts
// -------------------------------------------------------

export const modules: TModule[] = [
    dashboardModule,
    organizationModule,
    collaboratorModule,
    payrollModule,
    insightsModule,
];

/** Secoes do sidebar — derivadas automaticamente dos modules */
export const NAV_SECTIONS = ModuleEnumHelper.toNavSections(modules);

/** Lista plana de todas as rotas (busca, breadcrumbs, etc.) */
export const APP_ROUTES = NAV_SECTIONS.flatMap((s) => s.routes);

// -------------------------------------------------------
// Utilitarios
// -------------------------------------------------------

export { getBreadcrumbs, type BreadcrumbItem } from "@/config/breadcrumbs";

export function flattenRoutes(
    routes: AppRoute[],
    parentLabel = "",
): Array<AppRoute & { searchLabel: string }> {
    const result: Array<AppRoute & { searchLabel: string }> = [];
    for (const route of routes) {
        const searchLabel = parentLabel
            ? `${parentLabel} > ${route.label}`
            : route.label;
        result.push({ ...route, searchLabel });
        if (route.children) {
            result.push(...flattenRoutes(route.children, route.label));
        }
    }
    return result;
}
