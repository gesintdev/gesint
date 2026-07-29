"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {JOBPOSITION_TABLE_COLUMNS} from "@/modules/dp/organization/jobposition/config/jobposition.table-columns";
import type {JobPosition} from "@/modules/dp/organization/jobposition/dto/jobposition.dto";
import {JOBPOSITION_CLIENT_MESSAGES} from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import {jobpositionKeys} from "@/modules/dp/organization/jobposition/jobposition.query";
import {jobpositionService} from "@/modules/dp/organization/jobposition/services/jobposition.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {useCrudStatusActions} from "@/shared/components/crud/useCrudStatusActions";
import {QueryPagedTablePanel} from "@/shared/components/data/DataPanel";
import {
    CATALOG_STATUS_INITIAL_FILTERS,
    loadActiveAndInactiveRows,
    paginateCatalogRows,
} from "@/shared/lib/table/paginate-catalog-rows";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

export function JobPositionListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service: jobpositionService,
        queryKey: jobpositionKeys.all,
        entityLabel: "Cargo",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => jobpositionService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: jobpositionKeys.all});
            toast.success("Cargo excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: JOBPOSITION_CLIENT_MESSAGES.JOBPOSITION_LOAD_FAILED}),
    });
    const handleDelete = async (row: JobPosition) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<JobPosition>
            queryKey={jobpositionKeys.all}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => jobpositionService.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={JOBPOSITION_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) cargo cadastrado(a)."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                        onActivate={() => handleActivate(row.id)}
                        onDeactivate={() => void handleDeactivate(row.id)}
                        activateLoading={activateMutation.isPending && activateMutation.variables === row.id}
                        deactivateLoading={deactivateMutation.isPending && deactivateMutation.variables === row.id}
                    />
            )}
        />
    );
}
