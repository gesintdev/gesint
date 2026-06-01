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
import { usePathname } from "next/navigation";
import type { AppRoute, NavSection } from "@/modules/root/enum/ModuleEnum";
import {
    SystemEnum,
    SystemEnumHelper,
    type TSystemInfos,
} from "@/modules/root/enum/SystemEnum";
import {
    getNavSectionsForSystem,
    SETTINGS_NAV_SECTIONS,
    systemModuleGroups,
} from "@/config/routes";

type ActiveSystemContextValue = {
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

function resolveSystemFromPath(pathname: string): SystemEnum {
    return (
        SystemEnumHelper.findSystemForHref(pathname, systemModuleGroups)
        ?? SystemEnumHelper.getDefaultSystem()
    );
}

export function ActiveSystemProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [activeSystem, setActiveSystem] = useState<SystemEnum>(
        () => resolveSystemFromPath(pathname),
    );
    const [isSettingsMode, setIsSettingsMode] = useState(() => isSettingsPath(pathname));
    const prevPathnameRef = useRef(pathname);

    useEffect(() => {
        const stored = SystemEnumHelper.readStoredSystem();
        if (stored && !isSettingsPath(pathname)) {
            setActiveSystem(stored);
        }
    }, [pathname]);

    const systems = useMemo(
        () => SystemEnumHelper.getSortedSystems().map((id) => SystemEnumHelper.getById(id)),
        [],
    );

    const navSections = useMemo(
        () => (isSettingsMode ? SETTINGS_NAV_SECTIONS : getNavSectionsForSystem(activeSystem)),
        [activeSystem, isSettingsMode],
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
        const fromPath = SystemEnumHelper.findSystemForHref(pathname, systemModuleGroups);
        if (!fromPath) return;

        setActiveSystem(fromPath);
        SystemEnumHelper.persistSystem(fromPath);
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
    const { navSections } = useActiveSystem();
    return useMemo(() => navSections.flatMap((s) => s.routes), [navSections]);
}
