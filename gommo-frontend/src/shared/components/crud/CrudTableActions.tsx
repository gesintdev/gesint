"use client";

import {Check, PauseCircle, Pencil, Trash2} from "lucide-react";

import {
    deriveDeletePermission,
    deriveWritePermission,
    hasPermission,
    useSessionPermissions,
} from "@/shared/auth/permissions";
import {canWriteRoute} from "@/shared/auth/route-access";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {OpenInWorkspaceTabButton} from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import {findRouteById} from "@/shared/workspace/workspace-routes";
import {useWorkspaceTabOptional} from "@/shared/workspace/WorkspaceTabContext";

type CrudStatus = "ACTIVE" | "INACTIVE" | "DELETED" | string;

type CrudTableActionsProps<T extends {id: string; status?: CrudStatus}> = {
    row: T;
    onEdit: (row: T) => void;
    onDelete?: (row: T) => void;
    onActivate?: (row: T) => void;
    onDeactivate?: (row: T) => void;
    deleteLoading?: boolean;
    /** Exibe o botão de exclusão desabilitado (ex.: regra de negócio). */
    deleteDisabled?: boolean;
    deleteDisabledTitle?: string;
    activateLoading?: boolean;
    deactivateLoading?: boolean;
    editAriaLabel?: string;
    showOpenTab?: boolean;
    writePermission?: string;
    deletePermission?: string;
};

export function CrudTableActions<T extends {id: string; status?: CrudStatus}>({
    row,
    onEdit,
    onDelete,
    onActivate,
    onDeactivate,
    deleteLoading,
    deleteDisabled = false,
    deleteDisabledTitle,
    activateLoading,
    deactivateLoading,
    editAriaLabel = "Editar",
    showOpenTab = true,
    writePermission,
    deletePermission,
}: CrudTableActionsProps<T>) {
    const permissions = useSessionPermissions();
    const wsTab = useWorkspaceTabOptional();
    const route = wsTab ? findRouteById(wsTab.tab.routeId) : undefined;
    const canEdit = canWriteRoute(route, permissions, writePermission ?? deriveWritePermission(route?.permission));
    const canDelete =
        canWriteRoute(route, permissions) &&
        hasPermission(permissions, deletePermission ?? deriveDeletePermission(route?.permission));

    return (
        <>
            {showOpenTab ? <OpenInWorkspaceTabButton row={row} /> : null}
            {canEdit ? (
                <TableActionButton
                    actionVariant="edit"
                    aria-label={editAriaLabel}
                    leftIcon={<Pencil className="size-3.5" />}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                    }}
                />
            ) : null}
            {canEdit && row.status === "INACTIVE" && onActivate ? (
                <TableActionButton
                    actionVariant="open"
                    aria-label="Reativar"
                    leftIcon={<Check className="size-3.5" />}
                    loading={activateLoading}
                    onClick={(e) => {
                        e.stopPropagation();
                        onActivate(row);
                    }}
                />
            ) : null}
            {canEdit && row.status === "ACTIVE" && onDeactivate ? (
                <TableActionButton
                    actionVariant="open"
                    aria-label="Inativar"
                    leftIcon={<PauseCircle className="size-3.5" />}
                    loading={deactivateLoading}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeactivate(row);
                    }}
                />
            ) : null}
            {onDelete && canDelete ? (
                <TableActionButton
                    actionVariant="delete"
                    aria-label="Excluir"
                    title={deleteDisabled ? deleteDisabledTitle : undefined}
                    leftIcon={<Trash2 className="size-3.5" />}
                    loading={deleteLoading}
                    disabled={deleteDisabled}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (deleteDisabled) return;
                        onDelete(row);
                    }}
                />
            ) : null}
        </>
    );
}
