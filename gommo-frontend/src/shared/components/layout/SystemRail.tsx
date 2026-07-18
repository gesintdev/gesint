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

    return (
        <nav
            className="system-rail flex h-full w-(--system-rail-width) shrink-0 flex-col overflow-x-hidden border-r"
            style={{
                background: "var(--system-rail-bg)",
                borderColor: "var(--system-rail-border)",
            }}
            aria-label="Dominios do sistema"
        >
            <div className="flex min-h-0 w-full flex-1 flex-col items-stretch gap-1.5 overflow-x-hidden overflow-y-auto px-1 py-3">
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
                            className={clsx("system-rail-item", selected && "system-rail-item--active")}
                        >
                            <Icon className="size-4 shrink-0" strokeWidth={selected ? 2.25 : 2} />
                            <span className="system-rail-acronym">{system.acronym}</span>
                        </button>
                    );
                })}
            </div>
            {canOpenSettings ? (
                <div
                    className="mt-auto flex w-full flex-col items-stretch border-t px-1 pb-3 pt-2"
                    style={{ borderColor: "var(--system-rail-border)" }}
                >
                    <button
                        type="button"
                        title="Configurações do sistema"
                        aria-label="Configurações do sistema"
                        aria-current={mounted && isSettingsMode ? "true" : undefined}
                        onClick={handleOpenSettings}
                        className={clsx(
                            "system-rail-item system-rail-item--icon-only",
                            mounted && isSettingsMode && "system-rail-item--active",
                        )}
                    >
                        <Settings
                            className="size-4.5 shrink-0"
                            strokeWidth={mounted && isSettingsMode ? 2.25 : 2}
                        />
                    </button>
                </div>
            ) : null}
        </nav>
    );
}
