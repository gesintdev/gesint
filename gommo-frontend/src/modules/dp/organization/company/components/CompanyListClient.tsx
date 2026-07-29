"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {companyKeys} from "@/modules/dp/organization/company/company.query";
import {COMPANY_TABLE_COLUMNS} from "@/modules/dp/organization/company/config/company.table-columns";
import type {Company} from "@/modules/dp/organization/company/dto/company.dto";
import {COMPANY_CLIENT_MESSAGES} from "@/modules/dp/organization/company/exceptions/company.messages";
import {companyService} from "@/modules/dp/organization/company/services/company.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {useCrudStatusActions} from "@/shared/components/crud/useCrudStatusActions";
import {QueryPagedTablePanel} from "@/shared/components/data/DataPanel";
import {ExceptionCapture} from "@/shared/exceptions";
import {
    CATALOG_STATUS_INITIAL_FILTERS,
    loadActiveAndInactiveRows,
    paginateCatalogRows,
} from "@/shared/lib/table/paginate-catalog-rows";
import {SystemAlert} from "@/shared/system-alert";

export function CompanyListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service: companyService,
        queryKey: companyKeys.all,
        entityLabel: "Empresa",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => companyService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: companyKeys.all});
            toast.success("Empresa excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: COMPANY_CLIENT_MESSAGES.COMPANY_LOAD_FAILED}),
    });
    const handleDelete = async (row: Company) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<Company>
            queryKey={companyKeys.all}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => companyService.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={COMPANY_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma empresa cadastrada."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    onActivate={() => handleActivate(row.id)}
                    onDeactivate={() => void handleDeactivate(row.id)}
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    activateLoading={activateMutation.isPending && activateMutation.variables === row.id}
                    deactivateLoading={deactivateMutation.isPending && deactivateMutation.variables === row.id}
                />
            )}
        />
    );
}
