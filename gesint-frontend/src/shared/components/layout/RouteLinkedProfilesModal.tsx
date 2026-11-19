"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
    systemScopeFromEnum,
    systemScopeLabel,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import { profileKeys } from "@/modules/cfg/settings/profile/profile.query";
import { profileService } from "@/modules/cfg/settings/profile/services/profile.service";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { menuDependsOnProfile, profileGrantsMenu } from "@/shared/auth/profile-route-access";
import { Button } from "@/shared/components/ui/Button";
import { ModalHeader } from "@/shared/components/ui/ModalHeader";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { useActiveSystem } from "@/shared/context/ActiveSystemContext";
import { ExceptionCapture } from "@/shared/exceptions";

type RouteLinkedProfilesModalProps = {
    route: AppRoute | null;
    onClose: () => void;
};

export function RouteLinkedProfilesModal({ route, onClose }: RouteLinkedProfilesModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
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

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) dialog.showModal();
        else if (dialog.open) dialog.close();
    }, [open]);

    if (!mounted || !route) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-box flex max-h-[85vh] w-full max-w-lg flex-col gap-0 p-0">
                <ModalHeader
                    title="Perfis vinculados"
                    subtitle={`${route.label} · ${systemScopeLabel(system)}`}
                    onClose={onClose}
                />
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                    {!dependsOnProfile ? (
                        <p className="py-6 text-center text-sm text-base-content/55">
                            Este menu não exige perfil. Qualquer usuário autenticado pode abri-lo.
                        </p>
                    ) : profilesQuery.isLoading ? (
                        <SkeletonStack count={4} rowClassName="h-14 rounded-lg" />
                    ) : profilesQuery.isError ? (
                        <p className="py-6 text-center text-sm text-error">
                            {ExceptionCapture.displayMessage(
                                profilesQuery.error,
                                "Não foi possível carregar os perfis.",
                            )}
                        </p>
                    ) : linked.length === 0 ? (
                        <p className="py-6 text-center text-sm text-base-content/55">
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
                                        <p className="mt-0.5 text-xs text-base-content/55">{profile.description}</p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="border-t border-base-content/8 px-4 py-3">
                    <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
        </dialog>,
        document.body,
    );
}
