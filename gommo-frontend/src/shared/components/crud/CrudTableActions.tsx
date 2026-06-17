import { Pencil, Trash2 } from "lucide-react";

import {
    deriveDeletePermission,
    deriveWritePermission,
    hasPermission,
    useSessionPermissions,
} from "@/shared/auth/permissions";
import { canWriteRoute } from "@/shared/auth/route-access";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { findRouteById } from "@/shared/workspace/workspace-routes";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";

type CrudTableActionsProps<T extends { id: string }> = {
    row: T;
    onEdit: (row: T) => void;
    onDelete?: (row: T) => void;
    deleteLoading?: boolean;
    editAriaLabel?: string;
    showOpenTab?: boolean;
    writePermission?: string;
    deletePermission?: string;
};

export function CrudTableActions<T extends { id: string }>({
    row,
    onEdit,
    onDelete,
    deleteLoading,
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
            {onDelete && canDelete ? (
                <TableActionButton
                    actionVariant="delete"
                    aria-label="Excluir"
                    leftIcon={<Trash2 className="size-3.5" />}
                    loading={deleteLoading}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row);
                    }}
                />
            ) : null}
        </>
    );
}
