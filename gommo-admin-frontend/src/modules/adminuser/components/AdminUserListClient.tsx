"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ADMIN_USER_CLIENT_MESSAGES } from "@/modules/adminuser/exceptions/adminuser.messages";
import { ADMIN_USER_TABLE_COLUMNS } from "@/modules/adminuser/config/adminuser.table-columns";
import type { AdminUser } from "@/modules/adminuser/dto/adminuser.dto";
import { adminUserKeys } from "@/modules/adminuser/adminuser.query";
import { adminUserService } from "@/modules/adminuser/services/adminuser.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function AdminUserListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminUserService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
            toast.success("Usuário admin excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: ADMIN_USER_CLIENT_MESSAGES.LOAD_FAILED }),
    });

    return (
        <QueryTablePanel<AdminUser>
            queryKey={adminUserKeys.all}
            request={() => adminUserService.getAll()}
            columns={ADMIN_USER_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum usuário admin cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <>
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={async () => { if (await SystemAlert.confirmDelete()) deleteMutation.mutate(row.id); }} />
                </>
            )}
        />
    );
}
