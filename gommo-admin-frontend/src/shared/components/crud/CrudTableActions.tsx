"use client";
import { Pencil, Trash2 } from "lucide-react";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";

type CrudTableActionsProps<T extends { id: string }> = {
    row: T;
    onEdit: (row: T) => void;
    onDelete?: (row: T) => void;
    deleteLoading?: boolean;
    editAriaLabel?: string;
    showOpenTab?: boolean;
};

export function CrudTableActions<T extends { id: string }>({
    row,
    onEdit,
    onDelete,
    deleteLoading,
    editAriaLabel = "Editar",
    showOpenTab = true,
}: CrudTableActionsProps<T>) {
    return (
        <>
            {showOpenTab ? <OpenInWorkspaceTabButton row={row} /> : null}
            <TableActionButton
                actionVariant="edit"
                aria-label={editAriaLabel}
                leftIcon={<Pencil className="size-3.5" />}
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                }}
            />
            {onDelete ? (
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
