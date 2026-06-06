"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {usePathname} from "next/navigation";
import type {AppRoute, NavSection} from "@/modules/root/enum/ModuleEnum";
import {
    SystemEnum,
    SystemEnumHelper,
    type TSystemInfos,
} from "@/modules/root/enum/SystemEnum";
import {
    getNavSectionsForSystem,
    SETTINGS_NAV_SECTIONS,
} from "@/config/routes";
import { canAccessRoute } from "@/shared/auth/route-access";
import { useSessionPermissions } from "@/shared/auth/permissions";

type ActiveSystemContextValue = {
    /** Domínio selecionado no rail — menu lateral e conteúdo do dashboard. */
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

function resolveInitialSystem(): SystemEnum {
    return SystemEnumHelper.readStoredSystem() ?? SystemEnumHelper.getDefaultSystem();
}

function filterRoutesByPermissions(routes: AppRoute[], permissions: readonly string[]): AppRoute[] {
    const filtered: AppRoute[] = [];
    for (const route of routes) {
        const children = route.children
            ? filterRoutesByPermissions(route.children, permissions)
            : undefined;
        const hasDirectAccess = canAccessRoute(route, permissions);
        const hasVisibleChildren = Boolean(children?.length);
        if (!hasDirectAccess && !hasVisibleChildren) {
            continue;
        }
        filtered.push(children ? { ...route, children } : route);
    }
    return filtered;
}

function filterSectionsByPermissions(
    sections: NavSection[],
    permissions: readonly string[],
): NavSection[] {
    return sections
        .map((section) => ({
            ...section,
            routes: filterRoutesByPermissions(section.routes, permissions),
        }))
        .filter((section) => section.routes.length > 0);
}

export function ActiveSystemProvider({children}: { children: ReactNode }) {
    const pathname = usePathname();
    const permissions = useSessionPermissions();
    const [activeSystem, setActiveSystem] = useState<SystemEnum>(resolveInitialSystem);
    const [isSettingsMode, setIsSettingsMode] = useState(() => isSettingsPath(pathname));
    const prevPathnameRef = useRef(pathname);

    const systems = useMemo(() => {
        return SystemEnumHelper.getSortedSystems()
            .filter((systemId) => {
                const sections = getNavSectionsForSystem(systemId);
                return filterSectionsByPermissions(sections, permissions).length > 0;
            })
            .map((id) => SystemEnumHelper.getById(id));
    }, [permissions]);

    useEffect(() => {
        if (isSettingsMode || systems.length === 0) return;
        const exists = systems.some((system) => system.id === activeSystem);
        if (!exists) {
            setActiveSystem(systems[0].id);
        }
    }, [activeSystem, isSettingsMode, systems]);

    const navSections = useMemo(
        () =>
            filterSectionsByPermissions(
                isSettingsMode ? SETTINGS_NAV_SECTIONS : getNavSectionsForSystem(activeSystem),
                permissions,
            ),
        [activeSystem, isSettingsMode, permissions],
    );

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

    return (
        <ActiveSystemContext.Provider value={value}>{children}</ActiveSystemContext.Provider>
    );
}

export function useActiveSystem(): ActiveSystemContextValue {
    const ctx = useContext(ActiveSystemContext);
    if (!ctx) {
        throw new Error("useActiveSystem deve ser usado dentro de ActiveSystemProvider");
    }
    return ctx;
}

export function useActiveSystemRoutes(): AppRoute[] {
    const {navSections} = useActiveSystem();
    return useMemo(() => navSections.flatMap((s) => s.routes), [navSections]);
}
