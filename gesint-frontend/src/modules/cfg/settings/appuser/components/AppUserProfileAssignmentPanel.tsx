"use client";

import clsx from "clsx";
import {Building2} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {ActingProfileRolePicker} from "@/modules/cfg/settings/appuser/components/ActingProfileRolePicker";
import {ProfileRolePicker} from "@/modules/cfg/settings/appuser/components/ProfileRolePicker";
import type {RoleIdsByBranch} from "@/modules/cfg/settings/appuser/dto/appuser.dto";
import type {ActingProfile} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {
    ASSIGNABLE_SYSTEM_SCOPES,
    type SystemScope,
    systemScopeInfos,
    systemScopeLabel,
    systemScopeShortLabel,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {useProfileScopeAccess} from "@/modules/cfg/settings/profile/hooks/useProfileScopeAccess";
import {useActiveBranch} from "@/shared/context/ActiveBranchContext";

const MASTER_ITEM_CLASS =
    "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3.5 text-left transition-all duration-200";
const MASTER_ITEM_ACTIVE_CLASS =
    "border-primary/35 bg-primary/8 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";
const MASTER_ITEM_IDLE_CLASS =
    "border-base-content/10 bg-base-100 hover:border-base-content/18 hover:bg-base-100 hover:shadow-sm";

function profileCountLabel(count: number): string {
    if (count === 0) return "Nenhum perfil";
    return count === 1 ? "1 perfil" : `${count} perfis`;
}

function CountIndicator({count, active}: {count: number; active: boolean}) {
    if (count > 0) {
        return (
            <span
                className={clsx(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                    active ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/70",
                )}
            >
                {count}
            </span>
        );
    }
    return (
        <span
            className={clsx(
                "size-2 shrink-0 rounded-full transition-colors",
                active ? "bg-primary" : "bg-transparent group-hover:bg-base-content/20",
            )}
        />
    );
}

type AppUserProfileAssignmentPanelProps = {
    profilesBySystem: Partial<Record<SystemScope, Profile[]>>;
    actingProfilesBySystem: Partial<Record<SystemScope, ActingProfile[]>>;
    selectedIdsByBranch: RoleIdsByBranch;
    selectedActingIdsByBranch: RoleIdsByBranch;
    loadingBySystem: Partial<Record<SystemScope, boolean>>;
    actingLoadingBySystem: Partial<Record<SystemScope, boolean>>;
    onChange: (branchId: string, scope: SystemScope, ids: string[]) => void;
    onActingChange: (branchId: string, scope: SystemScope, ids: string[]) => void;
};

export function AppUserProfileAssignmentPanel({
    profilesBySystem,
    actingProfilesBySystem,
    selectedIdsByBranch,
    selectedActingIdsByBranch,
    loadingBySystem,
    actingLoadingBySystem,
    onChange,
    onActingChange,
}: AppUserProfileAssignmentPanelProps) {
    const {branches, activeBranchId} = useActiveBranch();
    const {scopes: availableSystems} = useProfileScopeAccess();
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [selectedSystem, setSelectedSystem] = useState<SystemScope>(ASSIGNABLE_SYSTEM_SCOPES[0] ?? "DP");

    useEffect(() => {
        if (branches.length === 0) {
            setSelectedBranchId(null);
            return;
        }
        if (selectedBranchId && branches.some((branch) => branch.id === selectedBranchId)) {
            return;
        }
        const fallback =
            branches.find((branch) => branch.id === activeBranchId) ??
            branches.find((branch) => branch.headquarters) ??
            branches[0];
        setSelectedBranchId(fallback.id);
    }, [branches, activeBranchId, selectedBranchId]);

    useEffect(() => {
        if (availableSystems.length === 0) return;
        if (availableSystems.includes(selectedSystem)) return;
        setSelectedSystem(availableSystems[0]!);
    }, [availableSystems, selectedSystem]);

    const selectedIdsBySystem = useMemo(
        () => (selectedBranchId ? (selectedIdsByBranch[selectedBranchId] ?? {}) : {}),
        [selectedBranchId, selectedIdsByBranch],
    );
    const selectedActingIdsBySystem = useMemo(
        () => (selectedBranchId ? (selectedActingIdsByBranch[selectedBranchId] ?? {}) : {}),
        [selectedBranchId, selectedActingIdsByBranch],
    );

    const selectedCountBySystem = useMemo(() => {
        const counts = {} as Record<SystemScope, number>;
        for (const scope of availableSystems) {
            counts[scope] =
                (selectedIdsBySystem[scope]?.length ?? 0) + (selectedActingIdsBySystem[scope]?.length ?? 0);
        }
        return counts;
    }, [availableSystems, selectedActingIdsBySystem, selectedIdsBySystem]);

    const selectedCountByBranch = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const branch of branches) {
            const bySystem = selectedIdsByBranch[branch.id] ?? {};
            const actingBySystem = selectedActingIdsByBranch[branch.id] ?? {};
            counts[branch.id] = availableSystems.reduce(
                (total, scope) =>
                    total + (bySystem[scope]?.length ?? 0) + (actingBySystem[scope]?.length ?? 0),
                0,
            );
        }
        return counts;
    }, [availableSystems, branches, selectedActingIdsByBranch, selectedIdsByBranch]);

    const showBranchColumn = branches.length > 1;
    const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null;
    const pickerKey = `${selectedBranchId ?? "none"}:${selectedSystem}`;

    return (
        <div
            className={clsx(
                "grid min-h-[28rem] w-full grid-cols-1 overflow-hidden sm:col-span-12",
                showBranchColumn
                    ? "lg:grid-cols-[minmax(15rem,18rem)_minmax(12rem,14rem)_minmax(0,1fr)_minmax(0,1fr)]"
                    : "lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)_minmax(0,1fr)]",
            )}
        >
            {showBranchColumn ? (
                <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 bg-base-200/25 lg:border-r lg:border-b-0">
                    <div className="shrink-0 px-4 pt-3 pb-2">
                        <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                            Filiais
                        </h3>
                        <p className="mt-0.5 text-[11px] text-base-content/45">
                            Selecione uma filial para vincular perfis
                        </p>
                    </div>
                    <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
                        {branches.map((branch) => {
                            const active = branch.id === selectedBranchId;
                            const selectedCount = selectedCountByBranch[branch.id] ?? 0;
                            return (
                                <li key={branch.id}>
                                    <button
                                        type="button"
                                        title={branch.name}
                                        onClick={() => setSelectedBranchId(branch.id)}
                                        className={clsx(
                                            MASTER_ITEM_CLASS,
                                            active ? MASTER_ITEM_ACTIVE_CLASS : MASTER_ITEM_IDLE_CLASS,
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
                                            <Building2 className="size-5" strokeWidth={2}/>
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span
                                                className={clsx(
                                                    "block truncate text-sm font-semibold",
                                                    active ? "text-primary" : "text-base-content",
                                                )}
                                            >
                                                {branch.name}
                                            </span>
                                            <span className="mt-0.5 flex items-center gap-2 text-[11px] text-base-content/50">
                                                {branch.headquarters ? (
                                                    <>
                                                        <span className="font-medium tracking-wide uppercase">
                                                            Matriz
                                                        </span>
                                                        <span className="text-base-content/25">·</span>
                                                    </>
                                                ) : null}
                                                <span>{profileCountLabel(selectedCount)}</span>
                                            </span>
                                        </span>
                                        <CountIndicator count={selectedCount} active={active}/>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : null}
            <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 bg-base-200/25 lg:border-r lg:border-b-0">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Sistemas
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Vincular perfis
                    </p>
                </div>
                <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
                    {availableSystems.map((scope) => {
                        const infos = systemScopeInfos(scope);
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
                                        MASTER_ITEM_CLASS,
                                        active ? MASTER_ITEM_ACTIVE_CLASS : MASTER_ITEM_IDLE_CLASS,
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
                                            {systemScopeShortLabel(scope)}
                                        </span>
                                        <span className="mt-0.5 block text-[11px] text-base-content/50">
                                            {profileCountLabel(selectedCount)}
                                        </span>
                                    </span>
                                    <CountIndicator count={selectedCount} active={active}/>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 lg:border-r lg:border-b-0">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Menus e Ações — {systemScopeLabel(selectedSystem)}
                        {showBranchColumn && selectedBranch ? ` · ${selectedBranch.name}` : ""}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        {selectedBranch
                            ? "Marque os perfis de menus e ações neste sistema, nesta filial"
                            : "Cadastre uma filial para vincular perfis a este usuário"}
                    </p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
                    <ProfileRolePicker
                        key={`menus:${pickerKey}`}
                        system={selectedSystem}
                        profiles={selectedBranchId ? (profilesBySystem[selectedSystem] ?? []) : []}
                        selectedIds={selectedIdsBySystem[selectedSystem] ?? []}
                        onChange={(ids) => {
                            if (!selectedBranchId) return;
                            onChange(selectedBranchId, selectedSystem, ids);
                        }}
                        loading={loadingBySystem[selectedSystem]}
                        fillHeight
                    />
                </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Atuações — {systemScopeLabel(selectedSystem)}
                        {showBranchColumn && selectedBranch ? ` · ${selectedBranch.name}` : ""}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        {selectedBranch
                            ? "Marque os perfis de atuação neste sistema, nesta filial"
                            : "Cadastre uma filial para vincular atuações a este usuário"}
                    </p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
                    <ActingProfileRolePicker
                        key={`acting:${pickerKey}`}
                        system={selectedSystem}
                        profiles={selectedBranchId ? (actingProfilesBySystem[selectedSystem] ?? []) : []}
                        selectedIds={selectedActingIdsBySystem[selectedSystem] ?? []}
                        onChange={(ids) => {
                            if (!selectedBranchId) return;
                            onActingChange(selectedBranchId, selectedSystem, ids);
                        }}
                        loading={actingLoadingBySystem[selectedSystem]}
                        fillHeight
                        branchName={selectedBranch?.name}
                    />
                </div>
            </div>
        </div>
    );
}
