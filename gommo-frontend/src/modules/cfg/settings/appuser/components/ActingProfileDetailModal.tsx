"use client";

import {useQuery} from "@tanstack/react-query";
import {Loader2, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {actingProfileKeys} from "@/modules/cfg/settings/actingprofile/actingprofile.query";
import {ActingProfileScopeFields} from "@/modules/cfg/settings/actingprofile/components/ActingProfileScopeFields";
import type {ActingProfile, SystemScope} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {actingProfileService} from "@/modules/cfg/settings/actingprofile/services/acting-profile.service";
import {systemScopeLabel} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {Button} from "@/shared/components/ui/Button";

type ActingProfileDetailModalProps = {
    open: boolean;
    profile: ActingProfile | null;
    system: SystemScope;
    branchName?: string | null;
    onClose: () => void;
};

export function ActingProfileDetailModal({
    open,
    profile,
    system,
    branchName,
    onClose,
}: ActingProfileDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const detailQuery = useQuery({
        queryKey: actingProfileKeys.detail(profile?.id ?? ""),
        queryFn: () => actingProfileService.getById(profile!.id),
        enabled: open && Boolean(profile?.id),
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) dialog.showModal();
        else if (dialog.open) dialog.close();
    }, [open]);

    if (!mounted || !profile) return null;

    const data = detailQuery.data ?? profile;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-box flex max-h-[85vh] w-full max-w-lg flex-col gap-0 p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/8 px-4 py-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-base-content">{data.name}</h3>
                        {data.description ? (
                            <p className="mt-0.5 text-xs text-base-content/55">{data.description}</p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle shrink-0"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4"/>
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                    {detailQuery.isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-base-content/50">
                            <Loader2 className="size-4 animate-spin"/>
                            Carregando abrangência…
                        </div>
                    ) : (
                        <ActingProfileScopeFields
                            dataScope={data.dataScope}
                            scopeRef={data.scopeRef ?? null}
                            onDataScopeChange={() => undefined}
                            onScopeRefChange={() => undefined}
                            disabled
                            profileName={data.name}
                            branchName={branchName ?? undefined}
                            systemLabel={systemScopeLabel(system)}
                            radioGroupName={`acting-profile-detail-scope-${data.id}`}
                        />
                    )}
                </div>
                <div className="flex justify-end border-t border-base-content/8 px-4 py-3">
                    <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    fechar
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
