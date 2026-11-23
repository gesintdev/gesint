"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
    systemScopeFromEnum,
    systemScopeLabel,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import { profileKeys } from "@/modules/cfg/settings/profile/profile.query";
import { profileService } from "@/modules/cfg/settings/profile/services/profile.service";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { menuDependsOnProfile, profileGrantsMenu } from "@/shared/auth/profile-route-access";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { useActiveSystem } from "@/shared/context/ActiveSystemContext";
import { ExceptionCapture } from "@/shared/exceptions";

type RouteLinkedProfilesModalProps = {
    route: AppRoute | null;
    onClose: () => void;
};

export function RouteLinkedProfilesModal({ route, onClose }: RouteLinkedProfilesModalProps) {
    const { activeSystem, isSettingsMode } = useActiveSystem();
    const system = isSettingsMode ? "CFG" : systemScopeFromEnum(activeSystem);
    const open = route != null;
    const dependsOnProfile = route ? menuDependsOnProfile(route) : false;

    const profilesQuery = useQuery({
        queryKey: profileKeys.list(system),
        queryFn: () => profileService.getAll(system),
        enabled: open && dependsOnProfile,
    });

    const linked = useMemo(() => {
        if (!route || !dependsOnProfile) return [];
        return (profilesQuery.data ?? [])
            .filter((profile) => profileGrantsMenu(profile, route))
            .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    }, [dependsOnProfile, profilesQuery.data, route]);

    const waitingProfiles = dependsOnProfile && profilesQuery.isPending;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Perfis vinculados"
            subtitle={route ? `${route.label} · ${systemScopeLabel(system)}` : undefined}
            size="md"
            footer={
                <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
                    Fechar
                </Button>
            }
        >
            {!route || !dependsOnProfile ? (
                <p className="py-6 text-center text-sm text-base-content/55">
                    Este menu não exige perfil. Qualquer usuário autenticado pode abri-lo.
                </p>
            ) : (
                <div className="flex min-h-36 flex-col justify-center">
                    {waitingProfiles ? (
                        <SkeletonStack
                            count={2}
                            rowClassName="h-12 rounded-lg"
                            className="w-full"
                        />
                    ) : profilesQuery.isError ? (
                        <p className="py-2 text-center text-sm text-error">
                            {ExceptionCapture.displayMessage(
                                profilesQuery.error,
                                "Não foi possível carregar os perfis.",
                            )}
                        </p>
                    ) : linked.length === 0 ? (
                        <p className="py-2 text-center text-sm text-base-content/55">
                            Nenhum perfil deste sistema dá acesso a este menu.
                        </p>
                    ) : (
                        <ul className="grid gap-2">
                            {linked.map((profile) => (
                                <li
                                    key={profile.id}
                                    className="rounded-lg border border-base-content/8 bg-base-100/40 px-3 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <p className="min-w-0 truncate text-sm font-medium text-base-content">
                                            {profile.name}
                                        </p>
                                        {profile.roleType === "ADMIN" ? (
                                            <span className="gesint-badge gesint-badge--info shrink-0">
                                                Administrador
                                            </span>
                                        ) : null}
                                    </div>
                                    {profile.description ? (
                                        <p className="mt-0.5 text-xs text-base-content/55">
                                            {profile.description}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </Modal>
    );
}
