"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CLIENT_USER_CLIENT_MESSAGES } from "@/modules/clientuser/exceptions/clientuser.messages";
import { CLIENT_USER_TABLE_COLUMNS } from "@/modules/clientuser/config/clientuser.table-columns";
import type { ClientUser } from "@/modules/clientuser/dto/clientuser.dto";
import { clientUserKeys } from "@/modules/clientuser/clientuser.query";
import { clientUserService } from "@/modules/clientuser/services/clientuser.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
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

    return (
        <QueryTablePanel<ClientUser>
            queryKey={clientUserKeys.all}
            request={() => clientUserService.getAll()}
            columns={CLIENT_USER_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum usuário de cliente cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <>
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} onClick={async () => { if (await SystemAlert.confirmDelete()) deleteMutation.mutate(row.id); }} />
                </>
            )}
        />
    );
}
