"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { TAX_TABLE_COLUMNS } from "@/modules/ctb/payroll/tax/config/tax-obligation.table-columns";
import type { TaxObligation } from "@/modules/ctb/payroll/tax/dto/tax-obligation.dto";
import { TAX_CLIENT_MESSAGES } from "@/modules/ctb/payroll/tax/exceptions/tax-obligation.messages";
import { taxObligationService } from "@/modules/ctb/payroll/tax/services/tax-obligation.service";
import { taxObligationKeys } from "@/modules/ctb/payroll/tax/tax.query";
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

export function TaxObligationListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service: taxObligationService,
        queryKey: taxObligationKeys.all,
        entityLabel: "Obrigação",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => taxObligationService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: taxObligationKeys.all });
            toast.success("Obrigação fiscal excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: TAX_CLIENT_MESSAGES.TAX_LOAD_FAILED }),
    });
    const handleDelete = async (row: TaxObligation) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<TaxObligation>
            queryKey={taxObligationKeys.all}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => taxObligationService.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={TAX_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma obrigação fiscal cadastrada."
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
