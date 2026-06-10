"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PAYSLIP_TABLE_COLUMNS } from "@/modules/payroll/payslip/config/payslip.table-columns";
import type { Payslip } from "@/modules/payroll/payslip/dto/payslip.dto";
import { PAYSLIP_CLIENT_MESSAGES } from "@/modules/payroll/payslip/exceptions/payslip.messages";
import { payslipKeys } from "@/modules/payroll/payslip/payslip.query";
import { payslipService } from "@/modules/payroll/payslip/services/payslip.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function PayslipListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => payslipService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: payslipKeys.all });
            toast.success("Holerite excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYSLIP_CLIENT_MESSAGES.PAYSLIP_LOAD_FAILED }),
    });
    const handleDelete = async (row: Payslip) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<Payslip>
            queryKey={payslipKeys.all}
            request={() => payslipService.getAll()}
            columns={PAYSLIP_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) holerite cadastrado(a)."
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
