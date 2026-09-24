"use client";

import clsx from "clsx";
import {Eye, Pencil, Search} from "lucide-react";
import {useMemo, useState} from "react";

import {ActingProfileDetailModal} from "@/modules/cfg/settings/appuser/components/ActingProfileDetailModal";
import type {ActingProfile, SystemScope} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {DATA_SCOPE_OPTIONS} from "@/modules/cfg/settings/actingprofile/services/acting-profile.service";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {InputCheckbox} from "@/shared/components/ui/input/index";
import {useWorkspaceNavigation} from "@/shared/workspace/useWorkspaceNavigation";
import {findRouteById} from "@/shared/workspace/workspace-routes";

const PROFILE_ROW_CLASS = "flex min-h-[2.25rem] items-center gap-2 rounded px-2 py-1.5 text-sm";
const SETTINGS_ACTING_PROFILES_ROUTE_ID = "settings-profiles-atuacoes";

function filterActingProfilesBySearch(profiles: ActingProfile[], query: string): ActingProfile[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return profiles;
    return profiles.filter((profile) => {
        if (profile.name.toLowerCase().includes(normalized)) return true;
        if (profile.description?.toLowerCase().includes(normalized)) return true;
        const scopeLabel = DATA_SCOPE_OPTIONS.find((option) => option.value === profile.dataScope)?.label;
        return scopeLabel?.toLowerCase().includes(normalized) ?? false;
    });
}

type ActingProfileRolePickerProps = {
    system: SystemScope;
    profiles: ActingProfile[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    loading?: boolean;
    fillHeight?: boolean;
    branchName?: string | null;
};

export function ActingProfileRolePicker({
    system,
    profiles,
    selectedIds,
    onChange,
    loading,
    fillHeight = false,
    branchName,
}: ActingProfileRolePickerProps) {
    const [search, setSearch] = useState("");
    const [detailProfile, setDetailProfile] = useState<ActingProfile | null>(null);
    const {openRouteRecord} = useWorkspaceNavigation();
    const selectedSet = new Set(selectedIds);
    const filteredProfiles = useMemo(() => filterActingProfilesBySearch(profiles, search), [profiles, search]);

    const toggle = (profileId: string, checked: boolean) => {
        const next = new Set(selectedSet);
        if (checked) next.add(profileId);
        else next.delete(profileId);
        onChange(Array.from(next));
    };

    const openProfileEdit = (profile: ActingProfile) => {
        const route = findRouteById(SETTINGS_ACTING_PROFILES_ROUTE_ID);
        if (!route) return;
        openRouteRecord(route, profile.id, {
            titleSuffix: profile.name,
            shortLabel: profile.name,
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="skeleton-shimmer h-30 w-full rounded-lg" />
            </div>
        );
    }

    const emptyMessage =
        profiles.length === 0 ? "Nenhum perfil de atuação cadastrado." : "Nenhum perfil encontrado.";

    return (
        <>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <label className="gommo-field mb-2 w-full shrink-0 text-sm!">
                    <Search className="size-3.5 shrink-0 text-base-content/40" strokeWidth={2} />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nome ou abrangência…"
                        className="text-sm!"
                    />
                </label>
                <ul
                    className={clsx(
                        "flex min-h-9 flex-col gap-1.5 overflow-y-auto rounded-lg border border-base-content/8 p-1.5",
                        fillHeight ? "min-h-0 flex-1" : "max-h-48",
                    )}
                >
                    {filteredProfiles.length === 0 ? (
                        <li>
                            <div className={clsx(PROFILE_ROW_CLASS, "text-xs text-base-content/45")}>
                                {emptyMessage}
                            </div>
                        </li>
                    ) : (
                        filteredProfiles.map((profile) => {
                            const checked = selectedSet.has(profile.id);
                            return (
                                <li
                                    key={profile.id}
                                    className={clsx(
                                        "flex items-center gap-0.5 rounded-lg border transition-colors",
                                        checked
                                            ? "border-primary/25 bg-primary/10"
                                            : "border-transparent hover:border-base-content/8 hover:bg-base-content/5",
                                    )}
                                >
                                    <label
                                        className={clsx(
                                            PROFILE_ROW_CLASS,
                                            "min-w-0 flex-1 cursor-pointer",
                                            checked ? "font-medium text-primary" : "text-base-content/85",
                                        )}
                                    >
                                        <InputCheckbox
                                            size="sm"
                                            checked={checked}
                                            onCheckedChange={(next) => toggle(profile.id, next)}
                                            aria-label={profile.name}
                                        />
                                        <span className="truncate">{profile.name}</span>
                                    </label>
                                    <div className="flex shrink-0 items-center pr-0.5">
                                        <TableActionButton
                                            actionVariant="edit"
                                            aria-label={`Editar atuação ${profile.name}`}
                                            leftIcon={<Pencil className="size-3.5" />}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openProfileEdit(profile);
                                            }}
                                        />
                                        <TableActionButton
                                            actionVariant="open"
                                            aria-label={`Abrangência de ${profile.name}`}
                                            leftIcon={<Eye className="size-3.5" />}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setDetailProfile(profile);
                                            }}
                                        />
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
            <ActingProfileDetailModal
                open={detailProfile != null}
                profile={detailProfile}
                system={system}
                branchName={branchName}
                onClose={() => setDetailProfile(null)}
            />
        </>
    );
}
