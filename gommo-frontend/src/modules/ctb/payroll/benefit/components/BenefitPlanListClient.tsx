"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { benefitplanKeys } from "@/modules/ctb/payroll/benefit/benefit.query";
import { BENEFIT_TABLE_COLUMNS } from "@/modules/ctb/payroll/benefit/config/benefit-plan.table-columns";
import type { BenefitPlan } from "@/modules/ctb/payroll/benefit/dto/benefit-plan.dto";
import { BENEFIT_CLIENT_MESSAGES } from "@/modules/ctb/payroll/benefit/exceptions/benefit-plan.messages";
import { benefitplanService } from "@/modules/ctb/payroll/benefit/services/benefit-plan.service";
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

export function BenefitPlanListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service: benefitplanService,
        queryKey: benefitplanKeys.all,
        entityLabel: "Benefício",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => benefitplanService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: benefitplanKeys.all });
            toast.success("Benefício excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: BENEFIT_CLIENT_MESSAGES.BENEFIT_LOAD_FAILED }),
    });
    const handleDelete = async (row: BenefitPlan) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<BenefitPlan>
            queryKey={benefitplanKeys.all}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => benefitplanService.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={BENEFIT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) benefício cadastrado(a)."
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
