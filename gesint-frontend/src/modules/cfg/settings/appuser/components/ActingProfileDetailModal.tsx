"use client";

import {useQuery} from "@tanstack/react-query";
import {Loader2} from "lucide-react";

import {actingProfileKeys} from "@/modules/cfg/settings/actingprofile/actingprofile.query";
import {ActingProfileScopeFields} from "@/modules/cfg/settings/actingprofile/components/ActingProfileScopeFields";
import type {ActingProfile, SystemScope} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";
import {actingProfileService} from "@/modules/cfg/settings/actingprofile/services/acting-profile.service";
import {systemScopeLabel} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {Modal} from "@/shared/components/ui/Modal";

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
    const detailQuery = useQuery({
        queryKey: actingProfileKeys.detail(profile?.id ?? ""),
        queryFn: () => actingProfileService.getById(profile!.id),
        enabled: open && Boolean(profile?.id),
    });

    const data = detailQuery.data ?? profile;

    return (
        <Modal
            open={open && Boolean(data)}
            onClose={onClose}
            title={data?.name ?? ""}
            subtitle={data?.description || undefined}
            size="md"
            actions={[{title: "Fechar", variant: "ghost", onClick: onClose}]}
        >
            {data ? (
                detailQuery.isLoading ? (
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
                )
            ) : null}
        </Modal>
    );
}
