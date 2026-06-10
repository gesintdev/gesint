"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { AppRoute, NavSection } from "@/modules/root/enum/ModuleEnum";
import { SystemEnum, SystemEnumHelper, type TSystemInfos } from "@/modules/root/enum/SystemEnum";
import { getNavSectionsForSystem, SETTINGS_NAV_SECTIONS, systemModuleGroups } from "@/config/routes";
import { useSession } from "next-auth/react";
import { useSessionPermissions } from "@/shared/auth/permissions";
import { canAccessRoute } from "@/shared/auth/route-access";

type ActiveSystemContextValue = {
    /** Dominio selecionado no rail — menu lateral e conteudo do dashboard. */
    activeSystem: SystemEnum;
    systems: TSystemInfos[];
    navSections: NavSection[];
    isSettingsMode: boolean;
    selectSystem: (system: SystemEnum) => void;
    openSettings: () => void;
    closeSettings: () => void;
};

const ActiveSystemContext = createContext<ActiveSystemContextValue | null>(null);

function isSettingsPath(pathname: string): boolean {
    return pathname.startsWith("/settings");
}

function resolveSystemFromPathname(pathname: string): SystemEnum {
    if (isSettingsPath(pathname)) {
        return SystemEnumHelper.getDefaultSystem();
    }
    return SystemEnumHelper.findSystemForHref(pathname, systemModuleGroups) ?? SystemEnumHelper.getDefaultSystem();
}

function filterRoutesByPermissions(routes: AppRoute[], permissions: readonly string[]): AppRoute[] {
    const filtered: AppRoute[] = [];
    for (const route of routes) {
        const children = route.children ? filterRoutesByPermissions(route.children, permissions) : undefined;
        const hasDirectAccess = canAccessRoute(route, permissions);
        const hasVisibleChildren = Boolean(children?.length);
        if (!hasDirectAccess && !hasVisibleChildren) {
            continue;
        }
        filtered.push(children ? { ...route, children } : route);
    }
    return filtered;
}

function filterSectionsByPermissions(sections: NavSection[], permissions: readonly string[]): NavSection[] {
    return sections
        .map((section) => ({
            ...section,
            routes: filterRoutesByPermissions(section.routes, permissions),
        }))
        .filter((section) => section.routes.length > 0);
}

export function ActiveSystemProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { status: sessionStatus } = useSession();
    const permissions = useSessionPermissions();
    const permissionsReady = sessionStatus !== "loading";
    const [activeSystem, setActiveSystem] = useState<SystemEnum>(() => resolveSystemFromPathname(pathname));
    const [isSettingsMode, setIsSettingsMode] = useState(() => isSettingsPath(pathname));
    const prevPathnameRef = useRef(pathname);
    const systems = useMemo(() => {
        if (!permissionsReady) {
            return [];
        }
        return SystemEnumHelper.getSortedSystems()
            .filter((systemId) => {
                const sections = getNavSectionsForSystem(systemId);
                return filterSectionsByPermissions(sections, permissions).length > 0;
            })
            .map((id) => SystemEnumHelper.getById(id));
    }, [permissions, permissionsReady]);

    useEffect(() => {
        const stored = SystemEnumHelper.readStoredSystem();
        if (stored) {
            setActiveSystem(stored);
        }
    }, []);

    useEffect(() => {
        if (isSettingsMode || systems.length === 0) return;
        const exists = systems.some((system) => system.id === activeSystem);
        if (!exists) {
            setActiveSystem(systems[0].id);
        }
    }, [activeSystem, isSettingsMode, systems]);

    const navSections = useMemo(() => {
        if (!permissionsReady) {
            return [];
        }
        return filterSectionsByPermissions(
            isSettingsMode ? SETTINGS_NAV_SECTIONS : getNavSectionsForSystem(activeSystem),
            permissions,
        );
    }, [activeSystem, isSettingsMode, permissions, permissionsReady]);
    const selectSystem = useCallback((system: SystemEnum) => {
        setIsSettingsMode(false);
        setActiveSystem(system);
        SystemEnumHelper.persistSystem(system);
    }, []);
    const openSettings = useCallback(() => {
        setIsSettingsMode(true);
    }, []);
    const closeSettings = useCallback(() => {
        setIsSettingsMode(false);
    }, []);

    useEffect(() => {
        if (pathname === prevPathnameRef.current) return;
        prevPathnameRef.current = pathname;
        if (isSettingsPath(pathname)) {
            setIsSettingsMode(true);
            return;
        }
        setIsSettingsMode(false);
        const fromPath = SystemEnumHelper.findSystemForHref(pathname, systemModuleGroups);
        if (fromPath) {
            setActiveSystem(fromPath);
        }
    }, [pathname]);

    const value = useMemo(
        () => ({
            activeSystem,
            systems,
            navSections,
            isSettingsMode,
            selectSystem,
            openSettings,
            closeSettings,
        }),
        [activeSystem, systems, navSections, isSettingsMode, selectSystem, openSettings, closeSettings],
    );

    return <ActiveSystemContext.Provider value={value}>{children}</ActiveSystemContext.Provider>;
}

export function useActiveSystem(): ActiveSystemContextValue {
    const ctx = useContext(ActiveSystemContext);
    if (!ctx) {
        throw new Error("useActiveSystem deve ser usado dentro de ActiveSystemProvider");
    }
    return ctx;
}

export function useActiveSystemRoutes(): AppRoute[] {
    const { navSections } = useActiveSystem();
    return useMemo(() => navSections.flatMap((s) => s.routes), [navSections]);
}
