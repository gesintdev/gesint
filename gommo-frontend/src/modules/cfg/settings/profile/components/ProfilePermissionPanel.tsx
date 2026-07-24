import clsx from "clsx";

import type {PermissionSummary} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {InputCheckbox} from "@/shared/components/ui/input";

const ACTION_LABELS: Record<string, string> = {
    read: "Consultar",
    write: "Criar / editar",
    delete: "Excluir",
    picker: "Seleção",
};

function actionLabel(authority: string): string {
    const action = authority.split(":")[1] ?? authority;
    return ACTION_LABELS[action] ?? action;
}

type ProfilePermissionPanelProps = {
    menuLabel: string | null;
    permissions: PermissionSummary[];
    selectedIds: Set<string>;
    onToggle: (permissionId: string, checked: boolean) => void;
    loading?: boolean;
};

export function ProfilePermissionPanel({
                                           menuLabel,
                                           permissions,
                                           selectedIds,
                                           onToggle,
                                           loading,
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

    return (
        <>
            <div className="shrink-0 border-b border-base-content/8 px-2 py-1">
                <h3 className="truncate text-xs font-semibold text-base-content">{menuLabel}</h3>
            </div>
            <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-1 pt-2">
                {permissions.map((permission) => {
                    const checked = selectedIds.has(permission.id);
                    return (
                        <li key={permission.id}>
                            <InputCheckbox
                                size="xs"
                                checked={checked}
                                onCheckedChange={(next) => onToggle(permission.id, next)}
                                label={actionLabel(permission.authority)}
                                className={clsx(
                                    "min-h-7 w-full rounded px-2 py-1.5 font-normal transition-colors",
                                    checked
                                        ? "bg-primary/10 text-primary"
                                        : "text-base-content/85 hover:bg-base-content/5",
                                )}
                                labelClassName="truncate text-xs font-normal leading-none"
                            />
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
