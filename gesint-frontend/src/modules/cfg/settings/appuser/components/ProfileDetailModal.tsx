import {useQuery} from "@tanstack/react-query";
import clsx from "clsx";
import {Loader2} from "lucide-react";

import {summarizeProfileMenus} from "@/modules/cfg/settings/appuser/lib/profile-menu-summary";
import type {Profile, SystemScope} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import {Button} from "@/shared/components/ui/Button";
import {Modal} from "@/shared/components/ui/Modal";

type ProfileDetailModalProps = {
    open: boolean;
    profile: Profile | null;
    system: SystemScope;
    onClose: () => void;
};

export function ProfileDetailModal({open, profile, system, onClose}: ProfileDetailModalProps) {
    const detailQuery = useQuery({
        queryKey: profileKeys.detail(profile?.id ?? ""),
        queryFn: () => profileService.getById(profile!.id),
        enabled: open && Boolean(profile?.id),
    });

    const data = detailQuery.data ?? profile;
    const menuSummaries = data ? summarizeProfileMenus(data.permissions, system) : [];

    return (
        <Modal
            open={open && Boolean(data)}
            onClose={onClose}
            title={data?.name ?? ""}
            subtitle={data?.description || undefined}
            size="md"
            footer={
                <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
                    Fechar
                </Button>
            }
        >
            {data ? (
                detailQuery.isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-base-content/50">
                        <Loader2 className="size-4 animate-spin"/>
                        Carregando detalhes…
                    </div>
                ) : menuSummaries.length === 0 ? (
                    <p className="py-6 text-center text-sm text-base-content/45">
                        Nenhum menu ou permissão vinculado a este perfil.
                    </p>
                ) : (
                    <ul className="grid gap-2">
                        {menuSummaries.map((item) => (
                            <li
                                key={item.menuLabel}
                                className="rounded-lg border border-base-content/8 bg-base-100/40 px-3 py-2"
                            >
                                <p className="text-sm font-medium text-base-content">{item.menuLabel}</p>
                                <ul className="mt-1 flex flex-wrap gap-1">
                                    {item.permissions.map((permission) => (
                                        <li
                                            key={`${item.menuLabel}-${permission}`}
                                            className={clsx(
                                                "rounded px-1.5 py-0.5 text-[11px]",
                                                "bg-primary/10 text-primary",
                                            )}
                                        >
                                            {permission}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )
            ) : null}
        </Modal>
    );
}
