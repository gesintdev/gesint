"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminUserKeys } from "@/modules/adminuser/adminuser.query";
import { ADMIN_USER_TABLE_COLUMNS } from "@/modules/adminuser/config/adminuser.table-columns";
import type { AdminUser } from "@/modules/adminuser/dto/adminuser.dto";
import { ADMIN_USER_CLIENT_MESSAGES } from "@/modules/adminuser/exceptions/adminuser.messages";
import { adminUserService } from "@/modules/adminuser/services/adminuser.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
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
    const handleDelete = async (row: AdminUser) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<AdminUser>
            queryKey={adminUserKeys.all}
            request={() => adminUserService.getAll()}
            columns={ADMIN_USER_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum usuário admin cadastrado."
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
