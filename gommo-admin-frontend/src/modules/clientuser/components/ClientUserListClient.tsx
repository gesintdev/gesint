"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { clientUserKeys } from "@/modules/clientuser/clientuser.query";
import { CLIENT_USER_TABLE_COLUMNS } from "@/modules/clientuser/config/clientuser.table-columns";
import type { ClientUser } from "@/modules/clientuser/dto/clientuser.dto";
import { CLIENT_USER_CLIENT_MESSAGES } from "@/modules/clientuser/exceptions/clientuser.messages";
import { clientUserService } from "@/modules/clientuser/services/clientuser.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function ClientUserListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => clientUserService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: clientUserKeys.all });
            toast.success("Usuário excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: CLIENT_USER_CLIENT_MESSAGES.LOAD_FAILED }),
    });
    const handleDelete = async (row: ClientUser) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<ClientUser>
            queryKey={clientUserKeys.all}
            request={() => clientUserService.getAll()}
            columns={CLIENT_USER_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum usuário de cliente cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    showOpenTab={false}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                />
            )}
        />
    );
}
