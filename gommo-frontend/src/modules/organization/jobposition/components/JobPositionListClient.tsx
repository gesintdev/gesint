"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/organization/jobposition/exceptions/jobposition.messages";
import { JOBPOSITION_TABLE_COLUMNS } from "@/modules/organization/jobposition/config/jobposition.table-columns";
import type { JobPosition } from "@/modules/organization/jobposition/dto/jobposition.dto";
import { jobpositionKeys } from "@/modules/organization/jobposition/jobposition.query";
import { jobpositionService } from "@/modules/organization/jobposition/services/jobposition.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function JobPositionListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => jobpositionService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobpositionKeys.all });
            toast.success("Cargo excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: JOBPOSITION_CLIENT_MESSAGES.JOBPOSITION_LOAD_FAILED }),
    });

    const handleDelete = async (row: JobPosition) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<JobPosition>
            queryKey={jobpositionKeys.all}
            request={() => jobpositionService.getAll()}
            columns={JOBPOSITION_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) cargo cadastrado(a)."
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
