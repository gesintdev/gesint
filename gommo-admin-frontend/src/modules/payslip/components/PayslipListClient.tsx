"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PAYSLIP_CLIENT_MESSAGES } from "@/modules/payslip/exceptions/payslip.messages";
import { PAYSLIP_TABLE_COLUMNS } from "@/modules/payslip/config/payslip.table-columns";
import type { Payslip } from "@/modules/payslip/dto/payslip.dto";
import { payslipKeys } from "@/modules/payslip/payslip.query";
import { payslipService } from "@/modules/payslip/services/payslip.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
