"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CONTRACT_TABLE_COLUMNS } from "@/modules/rh/person/contract/config/employment-contract.table-columns";
import { employmentcontractKeys } from "@/modules/rh/person/contract/contract.query";
import type { EmploymentContract } from "@/modules/rh/person/contract/dto/employment-contract.dto";
import { CONTRACT_CLIENT_MESSAGES } from "@/modules/rh/person/contract/exceptions/employment-contract.messages";
import { employmentcontractService } from "@/modules/rh/person/contract/services/employment-contract.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
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
        <QueryPagedTablePanel<EmploymentContract>
            queryKey={employmentcontractKeys.all}
            request={async (page, size, filters) =>
                paginateCatalogRows(await employmentcontractService.getAll(), page, size, filters)
            }
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
