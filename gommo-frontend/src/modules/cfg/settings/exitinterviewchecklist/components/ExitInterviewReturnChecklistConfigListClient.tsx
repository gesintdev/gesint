"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EXIT_INTERVIEW_RETURN_CHECKLIST_CONFIG_TABLE_COLUMNS } from "@/modules/cfg/settings/exitinterviewchecklist/config/exit-interview-return-checklist-config.table-columns";
import type { ExitInterviewReturnChecklistConfig } from "@/modules/cfg/settings/exitinterviewchecklist/dto/exit-interview-return-checklist-config.dto";
import { exitInterviewReturnChecklistConfigKeys } from "@/modules/cfg/settings/exitinterviewchecklist/exitinterviewchecklist.query";
import { exitInterviewReturnChecklistConfigService } from "@/modules/cfg/settings/exitinterviewchecklist/services/exit-interview-return-checklist-config.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function ExitInterviewReturnChecklistConfigListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => exitInterviewReturnChecklistConfigService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: exitInterviewReturnChecklistConfigKeys.all });
            toast.success("Item de devolução excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível excluir o item de devolução." }),
    });
    const handleDelete = async (row: ExitInterviewReturnChecklistConfig) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<ExitInterviewReturnChecklistConfig>
            queryKey={exitInterviewReturnChecklistConfigKeys.all}
            request={() => exitInterviewReturnChecklistConfigService.getAll()}
            columns={EXIT_INTERVIEW_RETURN_CHECKLIST_CONFIG_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum item de devolução cadastrado."
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
