import type { LucideIcon } from "lucide-react";
import type { WorkspacePageLoader } from "@/shared/workspace/workspace-page.types";

export type AppRoute = {
    id: string;
    label: string;
    href?: string;
    icon: LucideIcon;
    permission?: string;
    children?: AppRoute[];
    /** Chunk da tela no workspace (import dinâmico — não carrega no sidebar). */
    workspaceLoader?: WorkspacePageLoader;
};

export type NavSection = {
    id: string;
    label: string;
    routes: AppRoute[];
};

export type TModuleInfos = {
    id: string;
    name: string;
    order?: number;
};

export type TModule = {
    infos: TModuleInfos;
    routes: AppRoute[];
};

export enum ModuleEnum {
    ROOT = "root",
    DASHBOARD = "dashboard",
    CLIENTS = "clients",
    PLATFORM = "platform",
}

export interface IModuleHelper {
    getInfos(): Record<ModuleEnum, TModuleInfos>;
    getById(id: ModuleEnum): TModuleInfos;
    toNavSections(modules: TModule[]): NavSection[];
}

export class ModuleEnumHelper implements IModuleHelper {
    private static readonly registry: Record<ModuleEnum, TModuleInfos> = {
        [ModuleEnum.ROOT]: {
            id: "root",
            name: "Sistema",
            order: 0,
        },
        [ModuleEnum.DASHBOARD]: {
            id: "overview",
            name: "Visão geral",
            order: 1,
        },
        [ModuleEnum.CLIENTS]: {
            id: "clients",
            name: "Clientes",
            order: 2,
        },
        [ModuleEnum.PLATFORM]: {
            id: "platform",
            name: "Operação Gommo",
            order: 3,
        },
    };
    static getInfos(): Record<ModuleEnum, TModuleInfos> {
        return ModuleEnumHelper.registry;
    }
    static getById(id: ModuleEnum): TModuleInfos {
        return ModuleEnumHelper.registry[id];
    }
    static toNavSections(modules: TModule[]): NavSection[] {
        return [...modules]
            .sort((a, b) => (a.infos.order ?? 99) - (b.infos.order ?? 99))
            .map((m) => ({
                id: m.infos.id,
                label: m.infos.name,
                routes: m.routes,
            }));
    }
    getInfos(): Record<ModuleEnum, TModuleInfos> {
        return ModuleEnumHelper.getInfos();
    }
    getById(id: ModuleEnum): TModuleInfos {
        return ModuleEnumHelper.getById(id);
    }
    toNavSections(modules: TModule[]): NavSection[] {
        return ModuleEnumHelper.toNavSections(modules);
    }
}
