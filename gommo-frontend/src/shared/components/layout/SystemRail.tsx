import clsx from "clsx";
import { Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { settingsRoutes } from "@/modules/settings/config/settings.routes";
import { canAccessRoute } from "@/shared/auth/route-access";
import { useSessionPermissions } from "@/shared/auth/permissions";
import { useActiveSystem } from "@/shared/context/ActiveSystemContext";
import type { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { DASHBOARD_TAB_ID } from "@/shared/workspace/workspace-dashboard";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";

export function SystemRail() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const { activeSystem, systems, selectSystem, isSettingsMode, openSettings } = useActiveSystem();

    useEffect(() => {
        setMounted(true);
    }, []);
    const { openRouteModule, focusTabById } = useWorkspaceNavigation();
    const permissions = useSessionPermissions();
    const canOpenSettings = settingsRoutes.some((route) => canAccessRoute(route, permissions));

    const handleSelect = (system: SystemEnum) => {
        if (system === activeSystem && !isSettingsMode) {
            focusTabById(DASHBOARD_TAB_ID);
            return;
        }
        selectSystem(system);
        focusTabById(DASHBOARD_TAB_ID);
    };

    const handleOpenSettings = () => {
        openSettings();
        const firstRoute = settingsRoutes[0];
        if (firstRoute?.href && !pathname.startsWith("/settings")) {
            openRouteModule(firstRoute);
        }
    };

    return (
        <nav
            className="system-rail flex h-full w-(--system-rail-width) shrink-0 flex-col overflow-x-hidden border-r"
            style={{
                background: "var(--system-rail-bg)",
                borderColor: "var(--system-rail-border)",
            }}
            aria-label="Domínios do sistema"
        >
            <div className="flex min-h-0 w-full flex-1 flex-col items-stretch gap-1.5 overflow-x-hidden overflow-y-auto px-1 py-3">
                {systems.map((system) => {
                    const Icon = system.icon;
                    const selected =
                        mounted && !isSettingsMode && system.id === activeSystem;

                    return (
                        <button
                            key={system.id}
                            type="button"
                            title={system.name}
                            aria-label={system.name}
                            aria-current={selected ? "true" : undefined}
                            onClick={() => handleSelect(system.id)}
                            className={clsx(
                                "system-rail-item",
                                selected && "system-rail-item--active",
                            )}
                        >
                            <Icon className="size-4 shrink-0" strokeWidth={selected ? 2.25 : 2} />
                            <span className="system-rail-acronym">{system.acronym}</span>
                        </button>
                    );
                })}
            </div>

            <div
                className="mt-auto flex w-full flex-col items-stretch border-t px-1 pb-3 pt-2"
                style={{ borderColor: "var(--system-rail-border)" }}
            >
                {canOpenSettings ? (
                    <button
                        type="button"
                        title="Configurações do sistema"
                        aria-label="Configurações do sistema"
                        aria-current={mounted && isSettingsMode ? "true" : undefined}
                        onClick={handleOpenSettings}
                        className={clsx(
                            "system-rail-item",
                            mounted && isSettingsMode && "system-rail-item--active",
                        )}
                    >
                        <Settings
                            className="size-4 shrink-0"
                            strokeWidth={mounted && isSettingsMode ? 2.25 : 2}
                        />
                        <span className="system-rail-acronym">CFG</span>
                    </button>
                ) : null}
            </div>
        </nav>
    );
}
