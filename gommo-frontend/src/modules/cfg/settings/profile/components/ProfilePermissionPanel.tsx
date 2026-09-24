import clsx from "clsx";
import type {ReactNode} from "react";

import type {PermissionSummary} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {InputCheckbox} from "@/shared/components/ui/input/index";

const ACTION_LABELS: Record<string, string> = {
    read: "Consultar",
    write: "Criar / editar",
    delete: "Excluir",
    picker: "Seleção",
    export: "Exportar",
    sensitive: "Dado sensível",
    financial: "Dado financeiro",
    clinical: "Dados clínicos",
};

/** Fallback quando a API ainda não trouxe a description (hints do HTML RN-03). */
const SENSITIVE_HINTS: Record<string, string> = {
    "collaborator:sensitive": "raça/cor, PCD",
    "collaborator:financial": "dados bancários, salário",
    "admission:sensitive": "raça/cor, PCD",
    "admission:financial": "dados bancários, salário",
    "leave:sensitive": "CID, obs. médicas",
    "occupationalexam:clinical": "clínico",
};

const SENSITIVE_ACTIONS = new Set(["sensitive", "financial", "clinical"]);

function actionOf(authority: string): string {
    return authority.split(":")[1] ?? authority;
}

function actionLabel(authority: string): string {
    const action = actionOf(authority);
    return ACTION_LABELS[action] ?? action;
}

function isSensitiveAuthority(authority: string): boolean {
    return SENSITIVE_ACTIONS.has(actionOf(authority));
}

function sensitiveHint(permission: PermissionSummary): string | null {
    const fromApi = permission.description?.trim();
    if (fromApi) return fromApi;
    return SENSITIVE_HINTS[permission.authority] ?? null;
}

function PermissionCheckboxList({
    permissions,
    selectedIds,
    onToggle,
    withHints = false,
    disabled = false,
}: {
    permissions: PermissionSummary[];
    selectedIds: Set<string>;
    onToggle: (permissionId: string, checked: boolean) => void;
    withHints?: boolean;
    disabled?: boolean;
}) {
    return (
        <ul className="flex flex-col gap-1.5">
            {permissions.map((permission) => {
                const checked = selectedIds.has(permission.id);
                const hint = withHints ? sensitiveHint(permission) : null;
                const label: ReactNode = hint ? (
                    <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-xs font-normal leading-none">
                            {actionLabel(permission.authority)}
                        </span>
                        <span className="text-[10px] leading-snug font-normal text-base-content/45">
                            {hint}
                        </span>
                    </span>
                ) : (
                    actionLabel(permission.authority)
                );
                return (
                    <li key={permission.id}>
                        <InputCheckbox
                            size="xs"
                            checked={checked}
                            disabled={disabled}
                            readOnly={disabled}
                            onCheckedChange={disabled ? undefined : (next) => onToggle(permission.id, next)}
                            label={label}
                            aria-label={
                                hint
                                    ? `${actionLabel(permission.authority)} — ${hint}`
                                    : actionLabel(permission.authority)
                            }
                            className={clsx(
                                "min-h-7 w-full items-start rounded px-2 py-1.5 font-normal transition-colors",
                                disabled && "cursor-default opacity-90",
                                checked
                                    ? "bg-primary/10 text-primary"
                                    : "text-base-content/85 hover:bg-base-content/5",
                                disabled && !checked && "hover:bg-transparent",
                            )}
                            labelClassName="min-w-0 flex-1 truncate text-xs font-normal leading-none"
                        />
                    </li>
                );
            })}
        </ul>
    );
}

type ProfilePermissionPanelProps = {
    menuLabel: string | null;
    permissions: PermissionSummary[];
    selectedIds: Set<string>;
    onToggle: (permissionId: string, checked: boolean) => void;
    loading?: boolean;
    readOnly?: boolean;
};

export function ProfilePermissionPanel({
    menuLabel,
    permissions,
    selectedIds,
    onToggle,
    loading,
    readOnly = false,
}: ProfilePermissionPanelProps) {
    if (loading) {
        return <div className="skeleton-shimmer m-2 h-24 flex-1 rounded"/>;
    }

    if (!menuLabel) {
        return (
            <p className="flex flex-1 items-center justify-center px-3 text-center text-xs text-base-content/45">
                Selecione um menu.
            </p>
        );
    }

    if (permissions.length === 0) {
        return (
            <p className="flex flex-1 items-center justify-center px-3 text-center text-xs text-base-content/45">
                Nenhuma permissão para &quot;{menuLabel}&quot;.
            </p>
        );
    }

    const commonPermissions = permissions.filter((p) => !isSensitiveAuthority(p.authority));
    const sensitivePermissions = permissions.filter((p) => isSensitiveAuthority(p.authority));

    return (
        <>
            <div className="shrink-0 border-b border-base-content/8 px-2 py-1">
                <h3 className="truncate text-xs font-semibold text-base-content">{menuLabel}</h3>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1 pt-2">
                {commonPermissions.length > 0 ? (
                    <section className="flex flex-col gap-1.5">
                        <h4 className="px-2 text-[10px] font-semibold tracking-wide text-base-content/50 uppercase">
                            Comum
                        </h4>
                        <PermissionCheckboxList
                            permissions={commonPermissions}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                            disabled={readOnly}
                        />
                    </section>
                ) : null}
                {sensitivePermissions.length > 0 ? (
                    <section className="flex flex-col gap-1.5">
                        <h4 className="px-2 text-[10px] font-semibold tracking-wide text-warning/80 uppercase">
                            Sensível / financeiro
                        </h4>
                        <PermissionCheckboxList
                            permissions={sensitivePermissions}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                            withHints
                            disabled={readOnly}
                        />
                    </section>
                ) : null}
            </div>
        </>
    );
}

export function isSensitivePermissionAuthority(authority: string): boolean {
    return isSensitiveAuthority(authority);
}
