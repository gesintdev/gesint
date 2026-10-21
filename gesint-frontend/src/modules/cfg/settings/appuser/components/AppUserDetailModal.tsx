"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { AppUser } from "@/modules/cfg/settings/appuser/dto/appuser.dto";
import {
    ASSIGNABLE_SYSTEM_SCOPES,
    type SystemScope,
    systemScopeLabel,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type { Profile } from "@/modules/cfg/settings/profile/dto/profile.dto";
import { useActiveBranch } from "@/shared/context/ActiveBranchContext";

function DetailField({
    label,
    value,
    className,
    children,
}: {
    label: string;
    value?: string | null;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div
            className={`min-w-0 rounded-lg border border-base-content/8 bg-base-200/30 px-3 py-2${className ? ` ${className}` : ""}`}
        >
            <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">{label}</p>
            {children ?? (
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-base-content">{value || "—"}</p>
            )}
        </div>
    );
}

function profilesForSystem(
    rolesBySystem: Partial<Record<SystemScope, Profile[]>> | undefined,
    scope: SystemScope,
): Profile[] {
    return rolesBySystem?.[scope] ?? [];
}

function formatDateTime(iso?: string | null): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("pt-BR");
}

type AppUserDetailModalProps = {
    row: AppUser | null;
    open: boolean;
    onClose: () => void;
};

export function AppUserDetailModal({ row, open, onClose }: AppUserDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const { branches } = useActiveBranch();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open]);

    if (!mounted || !row) {
        return null;
    }

    const rolesByBranch = row.rolesByBranch ?? {};
    const branchNameById = new Map(branches.map((branch) => [branch.id, branch.name]));
    const branchesWithProfiles = Object.keys(rolesByBranch)
        .map((branchId) => ({
            branchId,
            name: branchNameById.get(branchId) ?? "Filial",
            systems: ASSIGNABLE_SYSTEM_SCOPES.filter(
                (scope) => profilesForSystem(rolesByBranch[branchId], scope).length > 0,
            ),
        }))
        .filter((entry) => entry.systems.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const singleBranch = branches.length <= 1;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-box flex max-h-[92vh] w-full max-w-2xl flex-col gap-0 p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                    <div className="min-w-0">
                        <h4 className="text-base font-semibold text-base-content">
                            {row.code != null ? `Usuário #${row.code}` : "Usuário"}
                        </h4>
                        <p className="mt-1 truncate text-sm text-base-content/65">
                            {row.username}
                        </p>
                        {row.collaboratorName ? (
                            <p className="mt-0.5 truncate text-xs text-base-content/45">
                                {row.collaboratorName}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-4">
                    <section className="grid gap-2 sm:grid-cols-2">
                        <DetailField label="Colaborador" value={row.collaboratorName} />
                        <DetailField label="Nome de usuário" value={row.username} />
                        <DetailField label="E-mail" value={row.email} className="sm:col-span-2" />
                        <DetailField
                            label="Primeiro acesso"
                            value={row.firstAccessCompleted ? "Concluído" : "Pendente"}
                        />
                        <DetailField label="Último login" value={formatDateTime(row.lastLogin)} />
                    </section>

                    <section className="mt-4">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-base-content/45">
                            {singleBranch ? "Perfis por sistema" : "Perfis por filial e sistema"}
                        </p>
                        {branchesWithProfiles.length === 0 ? (
                            <div className="rounded-lg border border-base-content/8 bg-base-200/30 px-3 py-4 text-sm text-base-content/55">
                                Nenhum perfil atribuído.
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {branchesWithProfiles.map((branch) => (
                                    <div
                                        key={branch.branchId}
                                        className="min-w-0 rounded-lg border border-base-content/8 bg-base-200/30 px-3 py-2.5"
                                    >
                                        {singleBranch ? null : (
                                            <p className="mb-1.5 text-xs font-semibold text-base-content">
                                                {branch.name}
                                            </p>
                                        )}
                                        <div className="grid gap-1.5">
                                            {branch.systems.map((scope) => (
                                                <div key={scope} className="min-w-0">
                                                    <p className="text-xs font-semibold text-base-content/70">
                                                        {systemScopeLabel(scope)}
                                                    </p>
                                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                        {profilesForSystem(
                                                            rolesByBranch[branch.branchId],
                                                            scope,
                                                        ).map((profile) => (
                                                            <span
                                                                key={profile.id}
                                                                className="gesint-badge gesint-badge--info"
                                                            >
                                                                {profile.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </dialog>,
        document.body,
    );
}
