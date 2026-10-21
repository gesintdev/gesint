"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {WORK_SCHEDULE_TABLE_COLUMNS} from "@/modules/cfg/settings/workschedule/config/work-schedule.table-columns";
import type {WorkSchedule} from "@/modules/cfg/settings/workschedule/dto/work-schedule.dto";
import {workScheduleService} from "@/modules/cfg/settings/workschedule/services/work-schedule.service";
import {workScheduleKeys} from "@/modules/cfg/settings/workschedule/workschedule.query";
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

export function WorkScheduleListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service: workScheduleService,
        queryKey: workScheduleKeys.all,
        entityLabel: "Escala",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => workScheduleService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: workScheduleKeys.all});
            toast.success("Escala excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível excluir a escala."}),
    });
    const handleDelete = async (row: WorkSchedule) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<WorkSchedule>
            queryKey={workScheduleKeys.all}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => workScheduleService.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={WORK_SCHEDULE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma escala cadastrada."
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
