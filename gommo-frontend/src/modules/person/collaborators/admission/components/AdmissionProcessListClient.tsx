"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Pencil, Trash2} from "lucide-react";
import {toast} from "sonner";
import {ADMISSION_CLIENT_MESSAGES} from "@/modules/person/collaborators/admission/exceptions/admission-process.messages";
import {ADMISSION_TABLE_COLUMNS} from "@/modules/person/collaborators/admission/config/admission-process.table-columns";
import type {AdmissionProcess} from "@/modules/person/collaborators/admission/dto/admission-process.dto";
import {admissionprocessKeys} from "@/modules/person/collaborators/admission/admission.query";
import {admissionprocessService} from "@/modules/person/collaborators/admission/services/admission-process.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {QueryTablePanel} from "@/shared/components/data/DataPanel";
import {OpenInWorkspaceTabButton} from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import {Button} from "@/shared/components/ui/Button";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

export function AdmissionProcessListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => admissionprocessService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: admissionprocessKeys.all});
            toast.success("Admissão excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED}),
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
                <>
                    <OpenInWorkspaceTabButton row={row}/>
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5"/>}
                            onClick={() => startEdit(row.id, row)}/>
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10"
                            leftIcon={<Trash2 className="size-3.5"/>}
                            loading={deleteMutation.isPending && deleteMutation.variables === row.id}
                            onClick={() => handleDelete(row)}/>
                </>
            )}
        />
    );
}
