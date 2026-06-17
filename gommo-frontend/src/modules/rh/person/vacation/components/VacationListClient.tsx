"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { LeaveRequest } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/rh/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { isApprovedVacation } from "@/modules/rh/person/leave/lib/leave-request.filters";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { VACATION_TABLE_COLUMNS } from "@/modules/rh/person/vacation/config/vacation.table-columns";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function VacationListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => leaverequestService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: leaverequestKeys.all });
            toast.success("Registro de férias excluído");
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
            queryKey={[...leaverequestKeys.all, "vacation-approved"]}
            request={async () => {
                const rows = await leaverequestService.getAll();
                return rows.filter(isApprovedVacation);
            }}
            columns={VACATION_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma férias cadastrada."
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
