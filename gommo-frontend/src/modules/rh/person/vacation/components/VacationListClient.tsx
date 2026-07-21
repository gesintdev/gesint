"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { LeaveRequest } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { VacationHistoryDetailModal } from "@/modules/rh/person/leave/components/VacationHistoryDetailModal";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/rh/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import {
    enrichVacationHistoryRows,
    type VacationHistoryRow,
} from "@/modules/rh/person/leave/lib/leave-history.enrich";
import { isApprovedVacation } from "@/modules/rh/person/leave/lib/leave-request.filters";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { VACATION_TABLE_COLUMNS } from "@/modules/rh/person/vacation/config/vacation.table-columns";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function VacationListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<VacationHistoryRow | null>(null);
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
        <>
            <QueryTablePanel<VacationHistoryRow>
                queryKey={[...leaverequestKeys.all, "vacation-approved"]}
                request={async () => {
                    const rows = await leaverequestService.getAll();
                    return enrichVacationHistoryRows(rows.filter(isApprovedVacation));
                }}
                columns={VACATION_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhuma férias cadastrada."
                onRowActivate={(row) => startEdit(row.id, row)}
                renderActions={(row) => (
                    <>
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Visualizar detalhes"
                            title="Visualizar detalhes"
                            leftIcon={<Eye className="size-3.5" />}
                            onClick={(event) => {
                                event.stopPropagation();
                                setSelected(row);
                            }}
                        />
                        <CrudTableActions
                            row={row}
                            onEdit={() => startEdit(row.id, row)}
                            onDelete={() => void handleDelete(row)}
                            deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                        />
                    </>
                )}
            />
            <VacationHistoryDetailModal
                row={selected}
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
            />
        </>
    );
}
