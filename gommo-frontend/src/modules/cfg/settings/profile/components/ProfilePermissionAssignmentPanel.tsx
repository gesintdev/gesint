"use client";

import clsx from "clsx";

import {ProfilePermissionPanel} from "@/modules/cfg/settings/profile/components/ProfilePermissionPanel";
import {
    ASSIGNABLE_SYSTEM_SCOPES,
    systemEnumFromScope,
    systemScopeLabel,
    systemScopeShortLabel,
    type SystemScope,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {PermissionSummary} from "@/modules/cfg/settings/profile/dto/profile.dto";
import type {AppRoute, NavSection} from "@/modules/root/enum/ModuleEnum";
import {SystemEnumHelper} from "@/modules/root/enum/SystemEnum";
import {NavRouteTree} from "@/shared/components/layout/NavRouteTree";

type ProfilePermissionAssignmentPanelProps = {
    system: SystemScope;
    onSystemChange: (system: SystemScope) => void;
    navSections: NavSection[];
    selectedRoute: AppRoute | null;
    markedRouteIds: ReadonlySet<string>;
    onRouteSelect: (route: AppRoute) => void;
    permissions: PermissionSummary[];
    selectedPermissionIds: ReadonlySet<string>;
    onTogglePermission: (permissionId: string, checked: boolean) => void;
    permissionsLoading?: boolean;
    selectedPermissionCount: number;
};

export function ProfilePermissionAssignmentPanel({
    system,
    onSystemChange,
    navSections,
    selectedRoute,
    markedRouteIds,
    onRouteSelect,
    permissions,
    selectedPermissionIds,
    onTogglePermission,
    permissionsLoading,
    selectedPermissionCount,
}: ProfilePermissionAssignmentPanelProps) {
    return (
        <div className="grid min-h-[28rem] w-full grid-cols-1 overflow-hidden sm:col-span-12 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)_minmax(14rem,18rem)]">
            <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 bg-base-200/25 lg:border-r lg:border-b-0">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Sistemas
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Selecione o sistema deste perfil
                    </p>
                </div>
                <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
                    {ASSIGNABLE_SYSTEM_SCOPES.map((scope) => {
                        const infos = SystemEnumHelper.getById(systemEnumFromScope(scope));
                        const Icon = infos.icon;
                        const active = scope === system;
                        const selectedCount = active ? selectedPermissionCount : 0;
                        return (
                            <li key={scope}>
                                <button
                                    type="button"
                                    title={systemScopeLabel(scope)}
                                    onClick={() => onSystemChange(scope)}
                                    className={clsx(
                                        "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3.5 text-left transition-all duration-200",
                                        active
                                            ? "border-primary/35 bg-primary/8 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
                                            : "border-base-content/10 bg-base-100 hover:border-base-content/18 hover:bg-base-100 hover:shadow-sm",
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                            active
                                                ? "bg-primary text-primary-content shadow-sm"
                                                : "bg-base-200 text-base-content/65 group-hover:bg-primary/10 group-hover:text-primary",
                                        )}
                                    >
                                        <Icon className="size-5" strokeWidth={2}/>
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={clsx(
                                                "block truncate text-sm font-semibold",
                                                active ? "text-primary" : "text-base-content",
                                            )}
                                        >
                                            {infos.name}
                                        </span>
                                        <span className="mt-0.5 flex items-center gap-2 text-[11px] text-base-content/50">
                                            <span className="font-medium tracking-wide uppercase">
                                                {systemScopeShortLabel(scope)}
                                            </span>
                                            <span className="text-base-content/25">·</span>
                                            <span>
                                                {selectedCount === 0
                                                    ? "Nenhuma permissão"
                                                    : selectedCount === 1
                                                      ? "1 permissão"
                                                      : `${selectedCount} permissões`}
                                            </span>
                                        </span>
                                    </span>
                                    {selectedCount > 0 ? (
                                        <span
                                            className={clsx(
                                                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                                                active
                                                    ? "bg-primary text-primary-content"
                                                    : "bg-base-200 text-base-content/70",
                                            )}
                                        >
                                            {selectedCount}
                                        </span>
                                    ) : (
                                        <span
                                            className={clsx(
                                                "size-2 shrink-0 rounded-full transition-colors",
                                                active ? "bg-primary" : "bg-transparent group-hover:bg-base-content/20",
                                            )}
                                        />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 lg:border-r lg:border-b-0">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Menus — {systemScopeLabel(system)}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Escolha o menu para configurar as permissões
                    </p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-1 pb-3">
                    <NavRouteTree
                        sections={navSections}
                        selectedRouteId={selectedRoute?.id ?? null}
                        markedRouteIds={markedRouteIds}
                        onRouteSelect={onRouteSelect}
                        embedded
                    />
                </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Permissões
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Marque as ações liberadas neste menu
                    </p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <ProfilePermissionPanel
                        menuLabel={selectedRoute?.label ?? null}
                        permissions={permissions}
                        selectedIds={selectedPermissionIds}
                        onToggle={onTogglePermission}
                        loading={permissionsLoading}
                    />
                </div>
            </div>
        </div>
    );
}
