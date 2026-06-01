"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { APP_USER_TABLE_COLUMNS } from "@/modules/settings/appuser/config/appuser.table-columns";
import type { AppUser } from "@/modules/settings/appuser/dto/appuser.dto";
import { appUserKeys } from "@/modules/settings/appuser/appuser.query";
import { appUserService } from "@/modules/settings/appuser/services/appuser.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function AppUserListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => appUserService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: appUserKeys.all });
            toast.success("Usuário excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível excluir o usuário." }),
    });

    const handleDelete = async (row: AppUser) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<AppUser>
            queryKey={appUserKeys.all}
            request={() => appUserService.getAll()}
            columns={APP_USER_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum usuário cadastrado."
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
