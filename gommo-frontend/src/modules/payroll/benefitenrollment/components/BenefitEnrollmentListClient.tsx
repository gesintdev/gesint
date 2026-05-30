"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BENEFIT_ENROLLMENT_TABLE_COLUMNS } from "@/modules/payroll/benefitenrollment/config/benefit-enrollment.table-columns";
import type { BenefitEnrollment } from "@/modules/payroll/benefitenrollment/dto/benefit-enrollment.dto";
import { BENEFIT_ENROLLMENT_CLIENT_MESSAGES } from "@/modules/payroll/benefitenrollment/exceptions/benefit-enrollment.messages";
import { benefitEnrollmentKeys } from "@/modules/payroll/benefitenrollment/benefitenrollment.query";
import { benefitEnrollmentService } from "@/modules/payroll/benefitenrollment/services/benefit-enrollment.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function BenefitEnrollmentListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => benefitEnrollmentService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: benefitEnrollmentKeys.all });
            toast.success("Vínculo de benefício excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: BENEFIT_ENROLLMENT_CLIENT_MESSAGES.BENEFIT_ENROLLMENT_LOAD_FAILED }),
    });

    const handleDelete = async (row: BenefitEnrollment) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<BenefitEnrollment>
            queryKey={benefitEnrollmentKeys.all}
            request={() => benefitEnrollmentService.getAll()}
            columns={BENEFIT_ENROLLMENT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum vínculo de benefício cadastrado."
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
