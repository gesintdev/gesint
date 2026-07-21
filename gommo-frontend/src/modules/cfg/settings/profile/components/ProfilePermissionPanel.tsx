import clsx from "clsx";

import type {PermissionSummary} from "@/modules/cfg/settings/profile/dto/profile.dto";

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
                Selecione um menu à esquerda.
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
            <ul className="min-h-0 flex-1 overflow-y-auto p-1">
                {permissions.map((permission) => {
                    const checked = selectedIds.has(permission.id);
                    return (
                        <li key={permission.id}>
                            <label
                                className={clsx(
                                    "flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition-colors",
                                    checked
                                        ? "bg-primary/10 font-medium text-primary"
                                        : "text-base-content/85 hover:bg-base-content/5",
                                )}
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-xs checkbox-primary shrink-0"
                                    checked={checked}
                                    onChange={(e) => onToggle(permission.id, e.target.checked)}
                                />
                                <span className="truncate">{actionLabel(permission.authority)}</span>
                            </label>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
