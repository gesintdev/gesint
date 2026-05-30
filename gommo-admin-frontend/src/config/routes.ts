/**
 * routes.ts — navegação do painel administrativo (gestão de clientes / plataforma).
 *
 * Novo módulo:
 *   1. config/<name>.routes.ts — UNICO arquivo: menu + tela (tabbedCrudRoute / customWorkspaceRoute)
 *   2. <name>.module.ts — infos + routes
 *   3. ModuleEnum + registry
 *   4. Incluir em `modules` abaixo
 */

export type {AppRoute, NavSection, TModule, TModuleInfos} from "@/modules/root/enum/ModuleEnum";
export {ModuleEnum, ModuleEnumHelper} from "@/modules/root/enum/ModuleEnum";

import type {AppRoute} from "@/modules/root/enum/ModuleEnum";
import {ModuleEnumHelper, type TModule} from "@/modules/root/enum/ModuleEnum";
import {dashboardModule} from "@/modules/dashboard/dashboard.module";
import {clientsModule} from "@/modules/clients/clients.module";
import {platformModule} from "@/modules/platform/platform.module";

export const modules: TModule[] = [
    dashboardModule,
    clientsModule,
    platformModule,
];

export const NAV_SECTIONS = ModuleEnumHelper.toNavSections(modules);
export const APP_ROUTES = NAV_SECTIONS.flatMap((s) => s.routes);

export {getBreadcrumbs, type BreadcrumbItem} from "@/config/breadcrumbs";

export function flattenRoutes(
    routes: AppRoute[],
    parentLabel = "",
): Array<AppRoute & { searchLabel: string }> {
    const result: Array<AppRoute & { searchLabel: string }> = [];
    for (const route of routes) {
        const searchLabel = parentLabel
            ? `${parentLabel} > ${route.label}`
            : route.label;
        result.push({...route, searchLabel});
        if (route.children) {
            result.push(...flattenRoutes(route.children, route.label));
        }
    }
    return result;
}
