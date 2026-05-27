"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/jobposition/exceptions/jobposition.messages";
import { JOBPOSITION_TABLE_COLUMNS } from "@/modules/jobposition/config/jobposition.table-columns";
import type { JobPosition } from "@/modules/jobposition/dto/jobposition.dto";
import { jobpositionKeys } from "@/modules/jobposition/jobposition.query";
import { jobpositionService } from "@/modules/jobposition/services/jobposition.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
