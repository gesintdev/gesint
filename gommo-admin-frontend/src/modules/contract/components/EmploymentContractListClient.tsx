"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CONTRACT_TABLE_COLUMNS } from "@/modules/contract/config/employment-contract.table-columns";
import { employmentcontractKeys } from "@/modules/contract/contract.query";
import type { EmploymentContract } from "@/modules/contract/dto/employment-contract.dto";
import { CONTRACT_CLIENT_MESSAGES } from "@/modules/contract/exceptions/employment-contract.messages";
import { employmentcontractService } from "@/modules/contract/services/employment-contract.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function EmploymentContractListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => employmentcontractService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: employmentcontractKeys.all });
            toast.success("Contrato excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: CONTRACT_CLIENT_MESSAGES.CONTRACT_LOAD_FAILED }),
    });
    const handleDelete = async (row: EmploymentContract) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<EmploymentContract>
            queryKey={employmentcontractKeys.all}
            request={() => employmentcontractService.getAll()}
            columns={CONTRACT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) contrato cadastrado(a)."
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
