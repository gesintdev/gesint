import type { LucideIcon } from "lucide-react";
import type { WorkspacePageLoader } from "@/shared/workspace/workspace-page.types";

// ─────────────────────────────────────────────
// Core navigation types (source-of-truth here,
// re-exported from @/config/routes for compat)
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Module system types
// ─────────────────────────────────────────────

/** Metadata that describes a module's identity inside the nav */
export type TModuleInfos = {
    /** Unique section id used in NavSection (e.g. "people") */
    id: string;
    /** Human-readable section label shown in the sidebar */
    name: string;
    /** Optional display order when building NAV_SECTIONS */
    order?: number;
};

/** A fully configured module: its metadata + its routes */
export type TModule = {
    infos: TModuleInfos;
    routes: AppRoute[];
};

// ─────────────────────────────────────────────
// Enum
// ─────────────────────────────────────────────

export enum ModuleEnum {
    ROOT         = "root",
    DASHBOARD    = "dashboard",
    ORGANIZATION = "organization",
    PERSON = "person",
    PAYROLL      = "payroll",
    INSIGHTS     = "insights",
}

// ─────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────

export interface IModuleHelper {
    /** Returns the full registry of module infos, keyed by ModuleEnum */
    getInfos(): Record<ModuleEnum, TModuleInfos>;

    /** Returns the infos for a single module by its enum key */
    getById(id: ModuleEnum): TModuleInfos;

    /**
     * Converts a TModule[] into the NavSection[] expected by the sidebar.
     * Modules are sorted by `infos.order` when present.
     */
    toNavSections(modules: TModule[]): NavSection[];
}

// ─────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────

export class ModuleEnumHelper implements IModuleHelper {

    /**
     * Central registry — every module enum value MUST have an entry here.
     * Module files call `ModuleEnumHelper.getInfos()[ModuleEnum.X]` to
     * bind their TModule.infos without duplicating the metadata.
     */
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
        [ModuleEnum.ORGANIZATION]: {
            id: "organization",
            name: "Organização",
            order: 2,
        },
        [ModuleEnum.PERSON]: {
            id: "people",
            name: "Colaboradores e vínculos",
            order: 3,
        },
        [ModuleEnum.PAYROLL]: {
            id: "payroll",
            name: "Folha e benefícios",
            order: 4,
        },
        [ModuleEnum.INSIGHTS]: {
            id: "insights",
            name: "Insights",
            order: 5,
        },
    };

    // ── Static API (primary usage) ───────────────

    /** Returns the full registry keyed by ModuleEnum */
    static getInfos(): Record<ModuleEnum, TModuleInfos> {
        return ModuleEnumHelper.registry;
    }

    /** Returns the infos for a single module */
    static getById(id: ModuleEnum): TModuleInfos {
        return ModuleEnumHelper.registry[id];
    }

    /**
     * Converts TModule[] → NavSection[], sorted by `infos.order`.
     * This is what `routes.ts` uses to build NAV_SECTIONS.
     */
    static toNavSections(modules: TModule[]): NavSection[] {
        return [...modules]
            .sort((a, b) => (a.infos.order ?? 99) - (b.infos.order ?? 99))
            .map((m) => ({
                id: m.infos.id,
                label: m.infos.name,
                routes: m.routes,
            }));
    }

    // ── Instance API (satisfies IModuleHelper) ───

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
