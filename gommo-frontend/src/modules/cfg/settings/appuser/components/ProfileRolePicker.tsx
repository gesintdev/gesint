import clsx from "clsx";
import {Eye, Pencil, Search} from "lucide-react";
import {useMemo, useState} from "react";

import {ProfileDetailModal} from "@/modules/cfg/settings/appuser/components/ProfileDetailModal";
import {filterProfilesBySearch} from "@/modules/cfg/settings/appuser/lib/profile-role-filter";
import type {Profile, SystemScope} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {InputCheckbox} from "@/shared/components/ui/input";
import {useWorkspaceNavigation} from "@/shared/workspace/useWorkspaceNavigation";
import {findRouteById} from "@/shared/workspace/workspace-routes";

const PROFILE_ROW_CLASS = "flex min-h-[2.25rem] items-center gap-2 rounded px-2 py-1.5 text-sm";
const SETTINGS_PROFILES_ROUTE_ID = "settings-profiles";

type ProfileRolePickerProps = {
    label?: string;
    system: SystemScope;
    profiles: Profile[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    loading?: boolean;
    /** Quando true, ocupa altura flexível (painel lado a lado). */
    fillHeight?: boolean;
};

export function ProfileRolePicker({
    label,
    system,
    profiles,
    selectedIds,
    onChange,
    loading,
    fillHeight = false,
}: ProfileRolePickerProps) {
    const [search, setSearch] = useState("");
    const [detailProfile, setDetailProfile] = useState<Profile | null>(null);
    const {openRouteRecord} = useWorkspaceNavigation();
    const selectedSet = new Set(selectedIds);
    const filteredProfiles = useMemo(
        () => filterProfilesBySearch(profiles, search, system),
        [profiles, search, system],
    );
    const toggle = (profileId: string, checked: boolean) => {
        const next = new Set(selectedSet);
        if (checked) next.add(profileId);
        else next.delete(profileId);
        onChange(Array.from(next));
    };
    const openProfileEdit = (profile: Profile) => {
        const route = findRouteById(SETTINGS_PROFILES_ROUTE_ID);
        if (!route) return;
        openRouteRecord(route, profile.id, {
            titleSuffix: profile.name,
            shortLabel: profile.name,
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                {label ? <p className="gommo-field__label mb-1.5">{label}</p> : null}
                <div className="skeleton-shimmer h-30 w-full rounded-lg"/>
            </div>
        );
    }

    const emptyMessage = profiles.length === 0 ? "Nenhum perfil cadastrado." : "Nenhum perfil encontrado.";

    return (
        <>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                {label ? <p className="gommo-field__label mb-1.5 shrink-0">{label}</p> : null}
                <label className="gommo-field mb-2 w-full shrink-0 text-sm!">
                    <Search className="size-3.5 shrink-0 text-base-content/40" strokeWidth={2}/>
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por descrição ou menu…"
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
                                            aria-label={`Editar perfil ${profile.name}`}
                                            leftIcon={<Pencil className="size-3.5"/>}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openProfileEdit(profile);
                                            }}
                                        />
                                        <TableActionButton
                                            actionVariant="open"
                                            aria-label={`Detalhes do perfil ${profile.name}`}
                                            leftIcon={<Eye className="size-3.5"/>}
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
            <ProfileDetailModal
                open={detailProfile != null}
                profile={detailProfile}
                system={system}
                onClose={() => setDetailProfile(null)}
            />
        </>
    );
}
