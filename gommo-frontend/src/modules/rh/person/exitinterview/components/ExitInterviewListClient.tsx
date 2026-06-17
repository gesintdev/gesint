"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EXITINTERVIEW_TABLE_COLUMNS } from "@/modules/rh/person/exitinterview/config/exit-interview.table-columns";
import type { ExitInterview } from "@/modules/rh/person/exitinterview/dto/exit-interview.dto";
import { EXITINTERVIEW_CLIENT_MESSAGES } from "@/modules/rh/person/exitinterview/exceptions/exit-interview.messages";
import { exitinterviewKeys } from "@/modules/rh/person/exitinterview/exitinterview.query";
import { exitinterviewService } from "@/modules/rh/person/exitinterview/services/exit-interview.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function ExitInterviewListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => exitinterviewService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.all });
            toast.success("Entrevista de desligamento excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: EXITINTERVIEW_CLIENT_MESSAGES.EXITINTERVIEW_LOAD_FAILED }),
    });
    const handleDelete = async (row: ExitInterview) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<ExitInterview>
            queryKey={exitinterviewKeys.all}
            request={() => exitinterviewService.getAll()}
            columns={EXITINTERVIEW_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) entrevista de desligamento cadastrado(a)."
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
