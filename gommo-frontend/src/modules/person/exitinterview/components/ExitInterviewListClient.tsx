"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EXITINTERVIEW_CLIENT_MESSAGES } from "@/modules/person/exitinterview/exceptions/exit-interview.messages";
import { EXITINTERVIEW_TABLE_COLUMNS } from "@/modules/person/exitinterview/config/exit-interview.table-columns";
import type { ExitInterview } from "@/modules/person/exitinterview/dto/exit-interview.dto";
import { exitinterviewKeys } from "@/modules/person/exitinterview/exitinterview.query";
import { exitinterviewService } from "@/modules/person/exitinterview/services/exit-interview.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
