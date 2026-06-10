"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { COMPANY_CLIENT_MESSAGES } from "@/modules/company/exceptions/company.messages";
import { COMPANY_TABLE_COLUMNS } from "@/modules/company/config/company.table-columns";
import type { Company } from "@/modules/company/dto/company.dto";
import { companyKeys } from "@/modules/company/company.query";
import { companyService } from "@/modules/company/services/company.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function CompanyListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => companyService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: companyKeys.all });
            toast.success("Empresa excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: COMPANY_CLIENT_MESSAGES.COMPANY_LOAD_FAILED }),
    });
    const handleDelete = async (row: Company) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<Company>
            queryKey={companyKeys.all}
            request={() => companyService.getAll()}
            columns={COMPANY_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) empresa cadastrado(a)."
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
