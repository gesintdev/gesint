import clsx from "clsx";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";

import { settingsRoutes } from "@/modules/cfg/settings/config/settings.routes";
import type { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { useSessionPermissions } from "@/shared/auth/permissions";
import { canAccessRoute } from "@/shared/auth/route-access";
import { useActiveSystem } from "@/shared/context/ActiveSystemContext";

function canAccessAnySettingsRoute(permissions: readonly string[]): boolean {
    const walk = (routes: typeof settingsRoutes): boolean =>
        routes.some((route) => {
            if (canAccessRoute(route, permissions)) return true;
            return route.children ? walk(route.children) : false;
        });
    return walk(settingsRoutes);
}

/**
 * Rail de domínios na ordem do registry de SystemEnum. CFG fica sempre por último.
 * Cápsula no modelo ClickUp: ícones menores e mais quadrados.
 */
export function SystemRail() {
    const [mounted, setMounted] = useState(false);
    const { activeSystem, systems, selectSystem, isSettingsMode, openSettings } = useActiveSystem();

    useEffect(() => {
        setMounted(true);
    }, []);

    const permissions = useSessionPermissions();
    const canOpenSettings = canAccessAnySettingsRoute(permissions);
    /** Só troca domínio/menus; mantém a aba ativa. O Painel já reage ao `activeSystem`. */
    const handleSelect = (system: SystemEnum) => {
        selectSystem(system);
    };
    const handleOpenSettings = () => {
        openSettings();
    };
    const settingsSelected = mounted && isSettingsMode;

    return (
        <nav
            className="system-rail flex h-full w-(--system-rail-width) shrink-0 flex-col overflow-hidden border-0 bg-(--sidebar-bg) pt-(--system-rail-pad-top) ps-(--system-rail-pad) pe-(--system-rail-gap) pb-(--system-rail-pad)"
            aria-label="Dominios do sistema"
        >
            <div className="system-rail__track flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto rounded-[length:var(--system-rail-radius)] bg-(--system-rail-bg) px-1 pb-1.5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {systems.map((system) => {
                    const Icon = system.icon;
                    const selected = mounted && !isSettingsMode && system.id === activeSystem;
                    return (
                        <button
                            key={system.id}
                            type="button"
                            title={system.name}
                            aria-label={system.name}
                            aria-current={selected ? "true" : undefined}
                            onClick={() => handleSelect(system.id)}
                            className={clsx(
                                "system-rail-item rounded-(--system-rail-radius)",
                                selected && "system-rail-item--active",
                            )}
                        >
                            <Icon className="size-4 shrink-0" strokeWidth={selected ? 2.25 : 2} />
                            <span className="system-rail-acronym">{system.acronym}</span>
                        </button>
                    );
                })}

                {canOpenSettings ? (
                    <>
                        <div
                            className="mx-1.5 my-1 h-px shrink-0 bg-(--system-rail-border)"
                            aria-hidden
                        />
                        <button
                            type="button"
                            title="Configurações do sistema"
                            aria-label="Configurações do sistema"
                            aria-current={settingsSelected ? "true" : undefined}
                            onClick={handleOpenSettings}
                            className={clsx(
                                "system-rail-item rounded-(--system-rail-radius)",
                                settingsSelected && "system-rail-item--active",
                            )}
                        >
                            <Settings className="size-4 shrink-0" strokeWidth={settingsSelected ? 2.25 : 2} />
                            <span className="system-rail-acronym">CFG</span>
                        </button>
                    </>
                ) : null}
            </div>
        </nav>
    );
}
