"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BENEFIT_CLIENT_MESSAGES } from "@/modules/payroll/benefit/exceptions/benefit-plan.messages";
import { BENEFIT_TABLE_COLUMNS } from "@/modules/payroll/benefit/config/benefit-plan.table-columns";
import type { BenefitPlan } from "@/modules/payroll/benefit/dto/benefit-plan.dto";
import { benefitplanKeys } from "@/modules/payroll/benefit/benefit.query";
import { benefitplanService } from "@/modules/payroll/benefit/services/benefit-plan.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
