"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {Building2, Check, Plus, Trash2} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {actingProfileKeys} from "@/modules/cfg/settings/actingprofile/actingprofile.query";
import {ActingProfileScopeFields} from "@/modules/cfg/settings/actingprofile/components/ActingProfileScopeFields";
import type {SystemScope} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {actingProfileService} from "@/modules/cfg/settings/actingprofile/services/acting-profile.service";
import {
    ASSIGNABLE_SYSTEM_SCOPES,
    systemScopeInfos,
    systemScopeLabel,
    systemScopeShortLabel,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {useProfileScopeAccess} from "@/modules/cfg/settings/profile/hooks/useProfileScopeAccess";
import {useHasPermission} from "@/shared/auth/permissions";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {Button} from "@/shared/components/ui/Button";
import {useActiveBranch} from "@/shared/context/ActiveBranchContext";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

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

export function ActingProfileListClient() {
    const {startCreate, startEdit} = useCrudScreen();
    const canWrite = useHasPermission("actingprofile:write");
    const canDelete = useHasPermission("actingprofile:delete");
    const queryClient = useQueryClient();
    const {branches, activeBranchId} = useActiveBranch();
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const {scopes: availableSystems} = useProfileScopeAccess(selectedBranchId);
    const [selectedSystem, setSelectedSystem] = useState<SystemScope>(ASSIGNABLE_SYSTEM_SCOPES[0] ?? "DP");
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

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

    const listQuery = useQuery({
        queryKey: actingProfileKeys.list(),
        queryFn: () => actingProfileService.getAll(undefined, true),
    });

    const profiles = useMemo(
        () => (listQuery.data ?? []).filter((row) => row.status !== "DELETED"),
        [listQuery.data],
    );

    const profilesForSystem = useMemo(
        () => profiles.filter((row) => row.system === selectedSystem && row.status === "ACTIVE"),
        [profiles, selectedSystem],
    );

    const countBySystem = useMemo(() => {
        const counts = {} as Record<SystemScope, number>;
        for (const scope of availableSystems) {
            counts[scope] = profiles.filter((row) => row.system === scope && row.status === "ACTIVE").length;
        }
        return counts;
    }, [availableSystems, profiles]);

    const selectedProfile = profilesForSystem.find((row) => row.id === selectedProfileId) ?? null;

    useEffect(() => {
        if (profilesForSystem.length === 0) {
            setSelectedProfileId(null);
            return;
        }
        if (selectedProfileId && profilesForSystem.some((row) => row.id === selectedProfileId)) {
            return;
        }
        setSelectedProfileId(profilesForSystem[0]!.id);
    }, [profilesForSystem, selectedProfileId]);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => actingProfileService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: actingProfileKeys.all});
            setSelectedProfileId(null);
            toast.success("Perfil de atuação excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível excluir o perfil."}),
    });

    const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null;

    return (
        <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,28rem)] lg:overflow-hidden">
            <div className="grid min-h-0 min-w-0 grid-cols-1 border-b border-base-content/8 lg:h-full lg:grid-cols-3 lg:border-r lg:border-b-0">
                <div className="flex max-h-52 min-h-0 min-w-0 flex-col border-b border-base-content/8 bg-base-200/25 sm:max-h-64 lg:max-h-none lg:h-full lg:border-r lg:border-b-0">
                    <div className="shrink-0 px-4 pt-3 pb-2">
                        <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                            Filiais
                        </h3>
                        <p className="mt-0.5 text-[11px] text-base-content/45">
                            Contexto da prévia de abrangência
                        </p>
                    </div>
                    <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
                        {branches.map((branch) => {
                            const active = branch.id === selectedBranchId;
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
                                            <Building2 className="size-5" strokeWidth={2} />
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
                                            {branch.headquarters ? (
                                                <span className="mt-0.5 text-[11px] font-medium tracking-wide text-base-content/50 uppercase">
                                                    Matriz
                                                </span>
                                            ) : null}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="flex max-h-52 min-h-0 min-w-0 flex-col border-b border-base-content/8 bg-base-200/25 sm:max-h-64 lg:max-h-none lg:h-full lg:border-r lg:border-b-0">
                    <div className="shrink-0 px-4 pt-3 pb-2">
                        <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                            Sistemas
                        </h3>
                        <p className="mt-0.5 text-[11px] text-base-content/45">
                            {selectedBranch
                                ? `Atrelados à filial: ${selectedBranch.name}`
                                : "Selecione um sistema"}
                        </p>
                    </div>
                    <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
                        {availableSystems.map((scope) => {
                            const infos = systemScopeInfos(scope);
                            const Icon = infos.icon;
                            const active = scope === selectedSystem;
                            const count = countBySystem[scope] ?? 0;
                            return (
                                <li key={scope}>
                                    <button
                                        type="button"
                                        title={systemScopeLabel(scope)}
                                        onClick={() => {
                                            setSelectedSystem(scope);
                                            setSelectedProfileId(null);
                                        }}
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
                                            <Icon className="size-5" strokeWidth={2} />
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
                                                <span>{profileCountLabel(count)}</span>
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="flex min-h-64 min-w-0 flex-col bg-base-100 lg:h-full lg:min-h-0">
                    <div className="flex shrink-0 items-start justify-between gap-2 px-4 pt-3 pb-2">
                        <div className="min-w-0">
                            <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                                Perfis — {systemScopeLabel(selectedSystem)}
                            </h3>
                            <p className="mt-0.5 text-[11px] text-base-content/45">
                                Selecione um perfil para ver a abrangência
                            </p>
                        </div>
                        {canWrite ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="shrink-0"
                                aria-label="Novo perfil de atuação"
                                title="Novo perfil de atuação"
                                onClick={() => startCreate()}
                            >
                                <Plus className="size-4" />
                            </Button>
                        ) : null}
                    </div>
                    <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
                        {listQuery.isLoading ? (
                            <li className="rounded-xl border border-dashed border-base-content/15 px-3 py-4 text-center text-xs text-base-content/50">
                                Carregando…
                            </li>
                        ) : null}
                        {!listQuery.isLoading && profilesForSystem.length === 0 ? (
                            <li className="rounded-xl border border-dashed border-base-content/15 px-3 py-4 text-center text-xs text-base-content/50">
                                Nenhum perfil de atuação neste sistema.
                            </li>
                        ) : null}
                        {profilesForSystem.map((profile) => {
                            const active = profile.id === selectedProfileId;
                            return (
                                <li key={profile.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProfileId(profile.id)}
                                        onDoubleClick={() => {
                                            if (canWrite) startEdit(profile.id, profile);
                                        }}
                                        className={clsx(
                                            MASTER_ITEM_CLASS,
                                            active ? MASTER_ITEM_ACTIVE_CLASS : MASTER_ITEM_IDLE_CLASS,
                                        )}
                                    >
                                        <span className="flex min-w-0 flex-1 items-start gap-2">
                                            <span className="min-w-0 flex-1">
                                                <span
                                                    className={clsx(
                                                        "block truncate text-sm font-semibold",
                                                        active ? "text-primary" : "text-base-content",
                                                    )}
                                                >
                                                    {profile.name}
                                                </span>
                                                {profile.description ? (
                                                    <span className="mt-0.5 line-clamp-2 text-[11px] text-base-content/50">
                                                        {profile.description}
                                                    </span>
                                                ) : null}
                                            </span>
                                            {active ? (
                                                <Check
                                                    className="mt-0.5 size-4 shrink-0 text-primary"
                                                    strokeWidth={2.5}
                                                    aria-hidden
                                                />
                                            ) : null}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <div className="flex h-full min-h-0 min-w-0 flex-col bg-base-200/15 px-4 py-3">
                {selectedProfile ? (
                    <>
                        <ActingProfileScopeFields
                            radioGroupName={`acting-profile-scope-${selectedProfile.id}`}
                            dataScope={selectedProfile.dataScope}
                            scopeRef={selectedProfile.scopeRef}
                            onDataScopeChange={() => undefined}
                            onScopeRefChange={() => undefined}
                            disabled
                            showPreview={false}
                            profileName={selectedProfile.name}
                            branchName={selectedBranch?.name}
                            systemLabel={systemScopeShortLabel(selectedSystem)}
                        />
                        {canWrite || canDelete ? (
                            <div className="mt-3 flex shrink-0 flex-wrap justify-end gap-2 border-t border-base-content/8 pt-3">
                                {canWrite ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEdit(selectedProfile.id, selectedProfile)}
                                    >
                                        Editar cadastro
                                    </Button>
                                ) : null}
                                {canDelete ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-error"
                                        disabled={deleteMutation.isPending}
                                        onClick={async () => {
                                            if (
                                                !(await SystemAlert.confirmDelete(
                                                    "Deseja excluir este perfil de atuação?",
                                                ))
                                            ) {
                                                return;
                                            }
                                            deleteMutation.mutate(selectedProfile.id);
                                        }}
                                    >
                                        <Trash2 className="size-4" />
                                        Excluir
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-base-content/15 px-4 py-8 text-center text-sm text-base-content/50">
                        Selecione um perfil na listagem ou cadastre um novo.
                    </div>
                )}
            </div>
        </div>
    );
}
