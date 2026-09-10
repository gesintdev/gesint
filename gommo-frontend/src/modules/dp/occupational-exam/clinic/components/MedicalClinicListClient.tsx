"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MEDICAL_CLINIC_TABLE_COLUMNS } from "@/modules/dp/occupational-exam/clinic/config/medical-clinic.table-columns";
import type { MedicalClinic } from "@/modules/dp/occupational-exam/clinic/dto/medical-clinic.dto";
import { medicalClinicKeys } from "@/modules/dp/occupational-exam/clinic/medical-clinic.query";
import { medicalClinicService } from "@/modules/dp/occupational-exam/clinic/services/medical-clinic.service";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/dp/occupational-exam/exceptions/occupational-exam.messages";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function MedicalClinicListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => medicalClinicService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: medicalClinicKeys.all });
            toast.success("Clinica medica excluida");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.CLINIC_DELETE_FAILED,
            }),
    });

    const handleDelete = async (row: MedicalClinic) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<MedicalClinic>
            queryKey={medicalClinicKeys.all}
            request={async (page, size, filters) =>
                paginateCatalogRows(await medicalClinicService.getAll(), page, size, filters)
            }
            columns={MEDICAL_CLINIC_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma clinica medica cadastrada."
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
