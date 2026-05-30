"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CONTRACT_CLIENT_MESSAGES } from "@/modules/person/contract/exceptions/employment-contract.messages";
import { CONTRACT_TABLE_COLUMNS } from "@/modules/person/contract/config/employment-contract.table-columns";
import type { EmploymentContract } from "@/modules/person/contract/dto/employment-contract.dto";
import { employmentcontractKeys } from "@/modules/person/contract/contract.query";
import { employmentcontractService } from "@/modules/person/contract/services/employment-contract.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
