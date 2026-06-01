"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/admission/exceptions/admission-process.messages";
import { ADMISSION_TABLE_COLUMNS } from "@/modules/admission/config/admission-process.table-columns";
import type { AdmissionProcess } from "@/modules/admission/dto/admission-process.dto";
import { admissionprocessKeys } from "@/modules/admission/admission.query";
import { admissionprocessService } from "@/modules/admission/services/admission-process.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function AdmissionProcessListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => admissionprocessService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: admissionprocessKeys.all });
            toast.success("Admissão excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED }),
    });

    const handleDelete = async (row: AdmissionProcess) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<AdmissionProcess>
            queryKey={admissionprocessKeys.all}
            request={() => admissionprocessService.getAll()}
            columns={ADMISSION_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) admissão cadastrado(a)."
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
