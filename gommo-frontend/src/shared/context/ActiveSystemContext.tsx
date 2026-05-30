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
    systemModuleGroups,
} from "@/config/routes";

type ActiveSystemContextValue = {
    activeSystem: SystemEnum;
    systems: TSystemInfos[];
    navSections: NavSection[];
    /** Seleciona o domínio do sidebar — abas abertas e rota atual permanecem. */
    selectSystem: (system: SystemEnum) => void;
};

const ActiveSystemContext = createContext<ActiveSystemContextValue | null>(null);

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
    const prevPathnameRef = useRef(pathname);

    /**
     * Preferência manual do rail (localStorage) só após hidratação —
     * evita mismatch SSR/client no aria-current do SystemRail.
     */
    useEffect(() => {
        const stored = SystemEnumHelper.readStoredSystem();
        if (stored) {
            setActiveSystem(stored);
        }
    }, []);

    const systems = useMemo(
        () => SystemEnumHelper.getSortedSystems().map((id) => SystemEnumHelper.getById(id)),
        [],
    );

    const navSections = useMemo(
        () => getNavSectionsForSystem(activeSystem),
        [activeSystem],
    );

    /** Troca só o menu lateral; workspace (abas + conteúdo) não é alterado. */
    const selectSystem = useCallback((system: SystemEnum) => {
        if (system === activeSystem) return;
        setActiveSystem(system);
        SystemEnumHelper.persistSystem(system);
    }, [activeSystem]);

    /**
     * Ao navegar (aba, link, voltar/avançar), alinha o domínio do sidebar com a rota atual.
     * Não sobrescreve escolha manual do rail enquanto a URL não mudar.
     */
    useEffect(() => {
        if (pathname === prevPathnameRef.current) return;
        prevPathnameRef.current = pathname;

        const fromPath = SystemEnumHelper.findSystemForHref(pathname, systemModuleGroups);
        if (!fromPath) return;

        setActiveSystem(fromPath);
        SystemEnumHelper.persistSystem(fromPath);
    }, [pathname]);

    const value = useMemo(
        () => ({ activeSystem, systems, navSections, selectSystem }),
        [activeSystem, systems, navSections, selectSystem],
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

/** Rotas planas do domínio ativo (busca no sidebar). */
export function useActiveSystemRoutes(): AppRoute[] {
    const { navSections } = useActiveSystem();
    return useMemo(() => navSections.flatMap((s) => s.routes), [navSections]);
}
