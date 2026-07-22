"use client";

import clsx from "clsx";
import {useMemo, useState} from "react";

import {ProfileRolePicker} from "@/modules/cfg/settings/appuser/components/ProfileRolePicker";
import {
    ASSIGNABLE_SYSTEM_SCOPES,
    systemEnumFromScope,
    systemScopeLabel,
    systemScopeShortLabel,
    type SystemScope,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {SystemEnumHelper} from "@/modules/root/enum/SystemEnum";

type AppUserProfileAssignmentPanelProps = {
    profilesBySystem: Partial<Record<SystemScope, Profile[]>>;
    selectedIdsBySystem: Partial<Record<SystemScope, string[]>>;
    loadingBySystem: Partial<Record<SystemScope, boolean>>;
    onChange: (scope: SystemScope, ids: string[]) => void;
};

export function AppUserProfileAssignmentPanel({
    profilesBySystem,
    selectedIdsBySystem,
    loadingBySystem,
    onChange,
}: AppUserProfileAssignmentPanelProps) {
    const [selectedSystem, setSelectedSystem] = useState<SystemScope>(ASSIGNABLE_SYSTEM_SCOPES[0] ?? "DP");

    const selectedCountBySystem = useMemo(() => {
        const counts = {} as Record<SystemScope, number>;
        for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
            counts[scope] = selectedIdsBySystem[scope]?.length ?? 0;
        }
        return counts;
    }, [selectedIdsBySystem]);

    return (
        <div className="grid min-h-[28rem] w-full grid-cols-1 overflow-hidden sm:col-span-12 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)]">
            <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 bg-base-200/25 lg:border-r lg:border-b-0">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Sistemas
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Selecione um sistema para vincular perfis
                    </p>
                </div>
                <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
                    {ASSIGNABLE_SYSTEM_SCOPES.map((scope) => {
                        const infos = SystemEnumHelper.getById(systemEnumFromScope(scope));
                        const Icon = infos.icon;
                        const active = scope === selectedSystem;
                        const selectedCount = selectedCountBySystem[scope] ?? 0;
                        return (
                            <li key={scope}>
                                <button
                                    type="button"
                                    title={systemScopeLabel(scope)}
                                    onClick={() => setSelectedSystem(scope)}
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
                                                    ? "Nenhum perfil"
                                                    : selectedCount === 1
                                                      ? "1 perfil"
                                                      : `${selectedCount} perfis`}
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
            <div className="flex min-h-0 min-w-0 flex-col">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Perfis — {systemScopeLabel(selectedSystem)}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Marque os perfis que este usuário poderá usar neste sistema
                    </p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
                    <ProfileRolePicker
                        key={selectedSystem}
                        system={selectedSystem}
                        profiles={profilesBySystem[selectedSystem] ?? []}
                        selectedIds={selectedIdsBySystem[selectedSystem] ?? []}
                        onChange={(ids) => onChange(selectedSystem, ids)}
                        loading={loadingBySystem[selectedSystem]}
                        fillHeight
                    />
                </div>
            </div>
        </div>
    );
}
