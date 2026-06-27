"use client";

import { useSession } from "next-auth/react";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";

import { getNavSectionsForSystem, SETTINGS_NAV_SECTIONS } from "@/config/routes";
import type { AppRoute, NavSection } from "@/modules/root/enum/ModuleEnum";
import { SystemEnum, SystemEnumHelper, type TSystemInfos } from "@/modules/root/enum/SystemEnum";
import { useSessionPermissions } from "@/shared/auth/permissions";
import { canAccessRoute } from "@/shared/auth/route-access";
import { SETTINGS_MODE_COOKIE_KEY } from "@/shared/lib/active-system-preferences";

const SETTINGS_MODE_STORAGE_KEY = "gommo-settings-mode";
const SETTINGS_MODE_EVENT = "gommo-settings-mode-change";

function subscribeSettingsMode(onStoreChange: () => void): () => void {
    if (typeof window === "undefined") {
        return () => {};
    }
    const handler = () => onStoreChange();
    window.addEventListener(SETTINGS_MODE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
        window.removeEventListener(SETTINGS_MODE_EVENT, handler);
        window.removeEventListener("storage", handler);
    };
}

function readSettingsModeFromCookie(): boolean {
    if (typeof document === "undefined") {
        return false;
    }
    const match = document.cookie.match(new RegExp(`(?:^|; )${SETTINGS_MODE_COOKIE_KEY}=([^;]*)`));
    return decodeURIComponent(match?.[1] ?? "") === "1";
}

function readSettingsMode(): boolean {
    if (typeof window === "undefined") {
        return false;
    }
    const stored = window.localStorage.getItem(SETTINGS_MODE_STORAGE_KEY);
    if (stored === "1" || stored === "0") {
        return stored === "1";
    }
    return readSettingsModeFromCookie();
}

function writeSettingsModeCookie(enabled: boolean): void {
    if (typeof document === "undefined") {
        return;
    }
    document.cookie = `${SETTINGS_MODE_COOKIE_KEY}=${enabled ? "1" : "0"};path=/;max-age=31536000;SameSite=Lax`;
}

function persistSettingsMode(enabled: boolean): void {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.setItem(SETTINGS_MODE_STORAGE_KEY, enabled ? "1" : "0");
    writeSettingsModeCookie(enabled);
    window.dispatchEvent(new Event(SETTINGS_MODE_EVENT));
}

function useHydrationSafeExternalStore<T>(
    subscribe: (onStoreChange: () => void) => () => void,
    getClientSnapshot: () => T,
    serverSnapshot: T,
): T {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);
    return useSyncExternalStore(
        subscribe,
        () => (hydrated ? getClientSnapshot() : serverSnapshot),
        () => serverSnapshot,
    );
}

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

/** Sistema ativo vem SOMENTE do rail (localStorage/cookie) — nunca da URL/aba aberta. */
function resolveActiveSystem(stored: SystemEnum | null): SystemEnum {
    return stored ?? SystemEnumHelper.getDefaultSystem();
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

type ActiveSystemProviderProps = {
    children: ReactNode;
    /** Valor do cookie gommo-active-system lido no servidor (SSR). */
    initialStoredSystem?: SystemEnum | null;
    /** Valor do cookie gommo-settings-mode lido no servidor (SSR). */
    initialSettingsMode?: boolean;
};

export function ActiveSystemProvider({
    children,
    initialStoredSystem = null,
    initialSettingsMode = false,
}: ActiveSystemProviderProps) {
    const { status: sessionStatus } = useSession();
    const permissions = useSessionPermissions();
    const permissionsReady = sessionStatus !== "loading";
    const storedSystem = useHydrationSafeExternalStore(
        SystemEnumHelper.subscribeStoredSystem,
        () => SystemEnumHelper.readStoredSystem(),
        initialStoredSystem,
    );
    const isSettingsMode = useHydrationSafeExternalStore(
        subscribeSettingsMode,
        () => readSettingsMode(),
        initialSettingsMode,
    );

    useEffect(() => {
        SystemEnumHelper.syncStoredSystemCookieFromLocalStorage();
        const fromStorage = window.localStorage.getItem(SETTINGS_MODE_STORAGE_KEY);
        if (fromStorage === "1" || fromStorage === "0") {
            writeSettingsModeCookie(fromStorage === "1");
        }
    }, []);

    const activeSystem = useMemo(() => resolveActiveSystem(storedSystem), [storedSystem]);
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
    const resolvedActiveSystem = useMemo(() => {
        if (isSettingsMode || systems.length === 0) {
            return activeSystem;
        }
        const exists = systems.some((system) => system.id === activeSystem);
        return exists ? activeSystem : systems[0].id;
    }, [activeSystem, isSettingsMode, systems]);
    const navSections = useMemo(() => {
        if (!permissionsReady) {
            return [];
        }
        return filterSectionsByPermissions(
            isSettingsMode ? SETTINGS_NAV_SECTIONS : getNavSectionsForSystem(resolvedActiveSystem),
            permissions,
        );
    }, [resolvedActiveSystem, isSettingsMode, permissions, permissionsReady]);
    const selectSystem = useCallback((system: SystemEnum) => {
        persistSettingsMode(false);
        SystemEnumHelper.persistSystem(system);
    }, []);
    const openSettings = useCallback(() => {
        persistSettingsMode(true);
    }, []);
    const closeSettings = useCallback(() => {
        persistSettingsMode(false);
    }, []);
    const value = useMemo(
        () => ({
            activeSystem: resolvedActiveSystem,
            systems,
            navSections,
            isSettingsMode,
            selectSystem,
            openSettings,
            closeSettings,
        }),
        [resolvedActiveSystem, systems, navSections, isSettingsMode, selectSystem, openSettings, closeSettings],
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
