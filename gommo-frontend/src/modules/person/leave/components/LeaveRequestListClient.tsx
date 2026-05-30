"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/person/leave/exceptions/leave-request.messages";
import { LEAVE_TABLE_COLUMNS } from "@/modules/person/leave/config/leave-request.table-columns";
import type { LeaveRequest } from "@/modules/person/leave/dto/leave-request.dto";
import { leaverequestKeys } from "@/modules/person/leave/leave.query";
import { leaverequestService } from "@/modules/person/leave/services/leave-request.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function LeaveRequestListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => leaverequestService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: leaverequestKeys.all });
            toast.success("Afastamento excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: LEAVE_CLIENT_MESSAGES.LEAVE_LOAD_FAILED }),
    });

    const handleDelete = async (row: LeaveRequest) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<LeaveRequest>
            queryKey={leaverequestKeys.all}
            request={() => leaverequestService.getAll()}
            columns={LEAVE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) afastamento cadastrado(a)."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
