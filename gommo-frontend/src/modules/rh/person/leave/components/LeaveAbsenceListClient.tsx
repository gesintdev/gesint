"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { LEAVE_TABLE_COLUMNS } from "@/modules/rh/person/leave/config/leave-request.table-columns";
import type { LeaveRequest } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/rh/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { isAbsenceLeave } from "@/modules/rh/person/leave/lib/leave-request.filters";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function LeaveAbsenceListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => leaverequestService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: leaverequestKeys.all });
            toast.success("Afastamento excluído");
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
            queryKey={[...leaverequestKeys.all, "absence"]}
            request={async () => {
                const rows = await leaverequestService.getAll();
                return rows.filter(isAbsenceLeave);
            }}
            columns={LEAVE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum afastamento cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                />
            )}
        />
    );
}
