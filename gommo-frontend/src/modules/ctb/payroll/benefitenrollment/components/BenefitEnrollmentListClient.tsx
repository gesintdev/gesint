"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { benefitEnrollmentKeys } from "@/modules/ctb/payroll/benefitenrollment/benefitenrollment.query";
import { BENEFIT_ENROLLMENT_TABLE_COLUMNS } from "@/modules/ctb/payroll/benefitenrollment/config/benefit-enrollment.table-columns";
import type { BenefitEnrollment } from "@/modules/ctb/payroll/benefitenrollment/dto/benefit-enrollment.dto";
import { BENEFIT_ENROLLMENT_CLIENT_MESSAGES } from "@/modules/ctb/payroll/benefitenrollment/exceptions/benefit-enrollment.messages";
import { benefitEnrollmentService } from "@/modules/ctb/payroll/benefitenrollment/services/benefit-enrollment.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
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
            ExceptionCapture.handle(err, {
                fallbackMessage: BENEFIT_ENROLLMENT_CLIENT_MESSAGES.BENEFIT_ENROLLMENT_LOAD_FAILED,
            }),
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
