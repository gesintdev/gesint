"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ADMISSION_PROCESS_KANBAN_COLUMN_TABLE_COLUMNS } from "@/modules/cfg/settings/admissionprocesskanban/config/admission-process-kanban-column.table-columns";
import type { AdmissionProcessKanbanColumn } from "@/modules/cfg/settings/admissionprocesskanban/dto/admission-process-kanban-column.dto";
import { admissionProcessKanbanColumnKeys } from "@/modules/cfg/settings/admissionprocesskanban/admission-process-kanban-column.query";
import { admissionProcessKanbanColumnService } from "@/modules/cfg/settings/admissionprocesskanban/services/admission-process-kanban-column.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { useCrudStatusActions } from "@/shared/components/crud/useCrudStatusActions";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import {
    CATALOG_STATUS_INITIAL_FILTERS,
    loadActiveAndInactiveRows,
    paginateCatalogRows,
} from "@/shared/lib/table/paginate-catalog-rows";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function AdmissionProcessKanbanColumnListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service: admissionProcessKanbanColumnService,
        queryKey: admissionProcessKanbanColumnKeys.all,
        entityLabel: "Coluna",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => admissionProcessKanbanColumnService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: admissionProcessKanbanColumnKeys.all });
            toast.success("Coluna excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível excluir a coluna." }),
    });
    const handleDelete = async (row: AdmissionProcessKanbanColumn) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<AdmissionProcessKanbanColumn>
            queryKey={admissionProcessKanbanColumnKeys.all}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => admissionProcessKanbanColumnService.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={ADMISSION_PROCESS_KANBAN_COLUMN_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma coluna cadastrada."
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
