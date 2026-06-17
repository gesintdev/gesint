"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PAYROLL_EVENT_TABLE_COLUMNS } from "@/modules/ctb/payroll/payroll-event/config/payroll-event.table-columns";
import type { PayrollEvent } from "@/modules/ctb/payroll/payroll-event/dto/payroll-event.dto";
import { PAYROLL_EVENT_CLIENT_MESSAGES } from "@/modules/ctb/payroll/payroll-event/exceptions/payroll-event.messages";
import { payrollEventKeys } from "@/modules/ctb/payroll/payroll-event/payroll-event.query";
import { payrollEventService } from "@/modules/ctb/payroll/payroll-event/services/payroll-event.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function PayrollEventListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => payrollEventService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: payrollEventKeys.all });
            toast.success("Evento de folha excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYROLL_EVENT_CLIENT_MESSAGES.PAYROLL_EVENT_LOAD_FAILED }),
    });

    const handleDelete = async (row: PayrollEvent) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<PayrollEvent>
            queryKey={payrollEventKeys.all}
            request={() => payrollEventService.getAll()}
            columns={PAYROLL_EVENT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum evento de folha cadastrado."
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
