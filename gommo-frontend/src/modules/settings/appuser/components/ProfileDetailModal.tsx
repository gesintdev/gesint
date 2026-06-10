import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { summarizeProfileMenus } from "@/modules/settings/appuser/lib/profile-menu-summary";
import type { Profile, SystemScope } from "@/modules/settings/profile/dto/profile.dto";
import { profileKeys } from "@/modules/settings/profile/profile.query";
import { profileService } from "@/modules/settings/profile/services/profile.service";
import { Button } from "@/shared/components/ui/Button";

type ProfileDetailModalProps = {
    open: boolean;
    profile: Profile | null;
    system: SystemScope;
    onClose: () => void;
};

export function ProfileDetailModal({ open, profile, system, onClose }: ProfileDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const detailQuery = useQuery({
        queryKey: profileKeys.detail(profile?.id ?? ""),
        queryFn: () => profileService.getById(profile!.id),
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
    const menuSummaries = summarizeProfileMenus(data.permissions, system);

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
                        <X className="size-4" />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                    {detailQuery.isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-base-content/50">
                            <Loader2 className="size-4 animate-spin" />
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
