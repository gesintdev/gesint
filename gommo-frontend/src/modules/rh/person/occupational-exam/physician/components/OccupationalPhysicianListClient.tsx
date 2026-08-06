"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/rh/person/occupational-exam/exceptions/occupational-exam.messages";
import { OCCUPATIONAL_PHYSICIAN_TABLE_COLUMNS } from "@/modules/rh/person/occupational-exam/physician/config/occupational-physician.table-columns";
import type { OccupationalPhysician } from "@/modules/rh/person/occupational-exam/physician/dto/occupational-physician.dto";
import { occupationalPhysicianKeys } from "@/modules/rh/person/occupational-exam/physician/occupational-physician.query";
import { occupationalPhysicianService } from "@/modules/rh/person/occupational-exam/physician/services/occupational-physician.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function OccupationalPhysicianListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => occupationalPhysicianService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: occupationalPhysicianKeys.all });
            toast.success("Medico ocupacional excluido");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.PHYSICIAN_DELETE_FAILED,
            }),
    });

    const handleDelete = async (row: OccupationalPhysician) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<OccupationalPhysician>
            queryKey={occupationalPhysicianKeys.all}
            request={() => occupationalPhysicianService.getAll()}
            columns={OCCUPATIONAL_PHYSICIAN_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum medico ocupacional cadastrado."
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
