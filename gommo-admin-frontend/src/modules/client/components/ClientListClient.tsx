"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CLIENT_CLIENT_MESSAGES } from "@/modules/client/exceptions/client.messages";
import { CLIENT_TABLE_COLUMNS } from "@/modules/client/config/client.table-columns";
import type { Client } from "@/modules/client/dto/client.dto";
import { clientKeys } from "@/modules/client/client.query";
import { clientService } from "@/modules/client/services/client.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function ClientListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => clientService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: clientKeys.all });
            toast.success("Cliente excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: CLIENT_CLIENT_MESSAGES.CLIENT_LOAD_FAILED }),
    });

    const handleDelete = async (row: Client) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<Client>
            queryKey={clientKeys.all}
            request={() => clientService.getAll()}
            columns={CLIENT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum cliente cadastrado."
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
