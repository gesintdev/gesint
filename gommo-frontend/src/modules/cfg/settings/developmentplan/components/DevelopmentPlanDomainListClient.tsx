"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useMemo} from "react";
import {toast} from "sonner";

import {
    type DevelopmentPlanDomainConfig
} from "@/modules/cfg/settings/developmentplan/config/development-plan-domain.config";
import {
    DevelopmentPlanDomainRecord,
    DevelopmentPlanDomainService
} from "@/modules/cfg/settings/developmentplan/services/development-plan-domain.service";
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

export function DevelopmentPlanDomainListClient({config}: { config: DevelopmentPlanDomainConfig }) {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const service = useMemo(() => new DevelopmentPlanDomainService(config.endpoint), [config.endpoint]);
    const queryKey = ["development-plan-domain", config.id] as const;
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service,
        queryKey,
        entityLabel: "Registro",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => service.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey});
            toast.success("Registro excluído");
        },
        onError: (err: unknown) => ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível excluir o registro."}),
    });
    const handleDelete = async (row: DevelopmentPlanDomainRecord) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<DevelopmentPlanDomainRecord>
            queryKey={queryKey}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => service.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={config.columns}
            rowKey="id"
            emptyMessage={config.emptyMessage}
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
