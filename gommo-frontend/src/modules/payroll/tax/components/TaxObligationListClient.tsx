"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TAX_TABLE_COLUMNS } from "@/modules/payroll/tax/config/tax-obligation.table-columns";
import type { TaxObligation } from "@/modules/payroll/tax/dto/tax-obligation.dto";
import { TAX_CLIENT_MESSAGES } from "@/modules/payroll/tax/exceptions/tax-obligation.messages";
import { taxObligationService } from "@/modules/payroll/tax/services/tax-obligation.service";
import { taxObligationKeys } from "@/modules/payroll/tax/tax.query";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function TaxObligationListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => taxObligationService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: taxObligationKeys.all });
            toast.success("Obrigação fiscal excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: TAX_CLIENT_MESSAGES.TAX_LOAD_FAILED }),
    });
    const handleDelete = async (row: TaxObligation) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<TaxObligation>
            queryKey={taxObligationKeys.all}
            request={() => taxObligationService.getAll()}
            columns={TAX_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma obrigação fiscal cadastrada."
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
