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
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function BenefitPlanListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
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
        <QueryTablePanel<BenefitPlan>
            queryKey={benefitplanKeys.all}
            request={() => benefitplanService.getAll()}
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
                />
            )}
        />
    );
}
