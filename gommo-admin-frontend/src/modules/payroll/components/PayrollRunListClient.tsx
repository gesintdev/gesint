"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PAYROLL_CLIENT_MESSAGES } from "@/modules/payroll/exceptions/payroll-run.messages";
import { PAYROLL_TABLE_COLUMNS } from "@/modules/payroll/config/payroll-run.table-columns";
import type { PayrollRun } from "@/modules/payroll/dto/payroll-run.dto";
import { payrollrunKeys } from "@/modules/payroll/payroll.query";
import { payrollrunService } from "@/modules/payroll/services/payroll-run.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
