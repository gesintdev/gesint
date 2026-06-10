"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PAYROLL_TABLE_COLUMNS } from "@/modules/payroll/config/payroll-run.table-columns";
import type { PayrollRun } from "@/modules/payroll/dto/payroll-run.dto";
import { PAYROLL_CLIENT_MESSAGES } from "@/modules/payroll/exceptions/payroll-run.messages";
import { payrollrunKeys } from "@/modules/payroll/payroll.query";
import { payrollrunService } from "@/modules/payroll/services/payroll-run.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function PayrollRunListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => payrollrunService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: payrollrunKeys.all });
            toast.success("Folha excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYROLL_CLIENT_MESSAGES.PAYROLL_LOAD_FAILED }),
    });
    const handleDelete = async (row: PayrollRun) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<PayrollRun>
            queryKey={payrollrunKeys.all}
            request={() => payrollrunService.getAll()}
            columns={PAYROLL_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) folha cadastrado(a)."
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
