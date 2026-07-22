import {Calculator, type LucideIcon, Users, Wallet} from "lucide-react";

import type {AppRoute, TModule} from "@/modules/root/enum/ModuleEnum";

export enum SystemEnum {
    DP = "dp",
    RH = "rh",
    CONTABILIDADE = "contabilidade",
}

export type TSystemInfos = {
    id: SystemEnum;
    /** Nome completo (tooltip / acessibilidade) */
    name: string;
    /** Sigla exibida abaixo do ícone (estilo ClickUp) */
    acronym: string;
    icon: LucideIcon;
};

export type TSystemModuleGroup = {
    system: SystemEnum;
    modules: TModule[];
};

const registry: Record<SystemEnum, TSystemInfos> = {
    [SystemEnum.DP]: {
        id: SystemEnum.DP,
        name: "Departamento Pessoal",
        acronym: "DP",
        icon: Wallet,
    },
    [SystemEnum.RH]: {
        id: SystemEnum.RH,
        name: "Recursos Humanos",
        acronym: "RH",
        icon: Users,
    },
    [SystemEnum.CONTABILIDADE]: {
        id: SystemEnum.CONTABILIDADE,
        name: "Contabilidade",
        acronym: "CTB",
        icon: Calculator,
    },
};
const STORAGE_KEY = "gommo-active-system";
const STORAGE_EVENT = "gommo-active-system-change";
/** Rotas compartilhadas entre dominios — nao forcam o sistema pelo href. */
const SYSTEM_NEUTRAL_PATHS = new Set(["/dashboard"]);

function normalizePathname(pathname: string): string {
    return pathname.split("?")[0].replace(/\/$/, "") || "/";
}

export class SystemEnumHelper {
    static getInfos(): Record<SystemEnum, TSystemInfos> {
        return registry;
    }

    static getById(id: SystemEnum): TSystemInfos {
        return registry[id];
    }

    static isValid(value: string): value is SystemEnum {
        return Object.values(SystemEnum).includes(value as SystemEnum);
    }

    /** Ordem alfabética pela sigla — primeiro é o padrão na inicialização. */
    static getSortedSystems(): SystemEnum[] {
        return (Object.values(SystemEnum) as SystemEnum[]).sort((a, b) =>
            registry[a].acronym.localeCompare(registry[b].acronym, "pt-BR"),
        );
    }

    static getDefaultSystem(): SystemEnum {
        return SystemEnumHelper.getSortedSystems()[0];
    }

    static isSystemNeutralPath(pathname: string): boolean {
        return SYSTEM_NEUTRAL_PATHS.has(normalizePathname(pathname));
    }

    static parseStoredSystemCookie(value: string | undefined): SystemEnum | null {
        if (!value || !SystemEnumHelper.isValid(value)) return null;
        return value;
    }

    static readStoredSystemFromDocumentCookie(): SystemEnum | null {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`));
        if (!match?.[1]) return null;
        return SystemEnumHelper.parseStoredSystemCookie(decodeURIComponent(match[1]));
    }

    static readStoredSystem(): SystemEnum | null {
        if (typeof window === "undefined") return null;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored && SystemEnumHelper.isValid(stored)) return stored;
        return SystemEnumHelper.readStoredSystemFromDocumentCookie();
    }

    static syncStoredSystemCookieFromLocalStorage(): void {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored || !SystemEnumHelper.isValid(stored)) return;
        const fromCookie = SystemEnumHelper.readStoredSystemFromDocumentCookie();
        if (fromCookie === stored) return;
        SystemEnumHelper.writeStoredSystemCookie(stored);
    }

    static persistSystem(system: SystemEnum): void {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(STORAGE_KEY, system);
        SystemEnumHelper.writeStoredSystemCookie(system);
        window.dispatchEvent(new Event(STORAGE_EVENT));
    }

    static subscribeStoredSystem(onStoreChange: () => void): () => void {
        if (typeof window === "undefined") return () => {
        };
        const handler = () => onStoreChange();
        window.addEventListener(STORAGE_EVENT, handler);
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener(STORAGE_EVENT, handler);
            window.removeEventListener("storage", handler);
        };
    }

    private static writeStoredSystemCookie(system: SystemEnum): void {
        if (typeof document === "undefined") return;
        document.cookie = `${STORAGE_KEY}=${encodeURIComponent(system)};path=/;max-age=31536000;SameSite=Lax`;
    }

    static findSystemsForRouteId(routeId: string, groups: TSystemModuleGroup[]): SystemEnum[] {
        const systems: SystemEnum[] = [];
        for (const group of groups) {
            for (const navModule of group.modules) {
                if (routeIdInRoutes(routeId, navModule.routes)) {
                    systems.push(group.system);
                    break;
                }
            }
        }
        return systems;
    }

    static findSystemForRouteId(
        routeId: string,
        groups: TSystemModuleGroup[],
        preferredSystem?: SystemEnum | null,
    ): SystemEnum | null {
        return pickPreferredSystem(SystemEnumHelper.findSystemsForRouteId(routeId, groups), preferredSystem);
    }

    static findSystemsForHref(pathname: string, groups: TSystemModuleGroup[]): SystemEnum[] {
        const normalized = normalizePathname(pathname);
        if (SystemEnumHelper.isSystemNeutralPath(normalized)) {
            return [];
        }
        const systems: SystemEnum[] = [];
        for (const group of groups) {
            for (const navModule of group.modules) {
                if (hrefInRoutes(normalized, navModule.routes)) {
                    systems.push(group.system);
                    break;
                }
            }
        }
        return systems;
    }

    static findSystemForHref(
        pathname: string,
        groups: TSystemModuleGroup[],
        preferredSystem?: SystemEnum | null,
    ): SystemEnum | null {
        return pickPreferredSystem(SystemEnumHelper.findSystemsForHref(pathname, groups), preferredSystem);
    }

    static firstNavigableRoute(routes: AppRoute[]): AppRoute | null {
        for (const route of routes) {
            if (route.href) return route;
            if (route.children?.length) {
                const nested = SystemEnumHelper.firstNavigableRoute(route.children);
                if (nested) return nested;
            }
        }
        return null;
    }

    static getDefaultRoute(groups: TSystemModuleGroup[], system: SystemEnum): AppRoute | null {
        const group = groups.find((g) => g.system === system);
        if (!group) return null;
        for (const navModule of group.modules) {
            const route = SystemEnumHelper.firstNavigableRoute(navModule.routes);
            if (route) return route;
        }
        return null;
    }

    static getAcronymForHref(
        href: string,
        groups: TSystemModuleGroup[],
        preferredSystem?: SystemEnum | null,
    ): string | null {
        const system = SystemEnumHelper.findSystemForHref(href, groups, preferredSystem);
        return system ? SystemEnumHelper.getById(system).acronym : null;
    }

    static getSystemForHref(
        href: string,
        groups: TSystemModuleGroup[],
        preferredSystem?: SystemEnum | null,
    ): SystemEnum | null {
        return SystemEnumHelper.findSystemForHref(href, groups, preferredSystem);
    }
}

/** Rotas compartilhadas (ex.: Admissão em RH e DP) preferem o sistema ativo. */
function pickPreferredSystem(
    systems: SystemEnum[],
    preferredSystem?: SystemEnum | null,
): SystemEnum | null {
    if (systems.length === 0) return null;
    if (systems.length === 1) return systems[0];
    if (preferredSystem && systems.includes(preferredSystem)) return preferredSystem;
    return systems[0];
}

function routeIdInRoutes(routeId: string, routes: AppRoute[]): boolean {
    for (const route of routes) {
        if (route.id === routeId) return true;
        if (route.children?.length && routeIdInRoutes(routeId, route.children)) return true;
    }
    return false;
}

function hrefInRoutes(pathname: string, routes: AppRoute[]): boolean {
    for (const route of routes) {
        if (route.href === pathname) return true;
        if (route.children?.length && hrefInRoutes(pathname, route.children)) return true;
    }
    return false;
}
