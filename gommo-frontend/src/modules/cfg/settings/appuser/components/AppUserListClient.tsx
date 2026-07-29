"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { appUserKeys } from "@/modules/cfg/settings/appuser/appuser.query";
import { AppUserDetailModal } from "@/modules/cfg/settings/appuser/components/AppUserDetailModal";
import { APP_USER_TABLE_COLUMNS } from "@/modules/cfg/settings/appuser/config/appuser.table-columns";
import type { AppUser } from "@/modules/cfg/settings/appuser/dto/appuser.dto";
import { appUserService } from "@/modules/cfg/settings/appuser/services/appuser.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function AppUserListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<AppUser | null>(null);
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
        <>
            <QueryTablePanel<AppUser>
                queryKey={appUserKeys.all}
                request={() => appUserService.getAll()}
                columns={APP_USER_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhum usuário cadastrado."
                onRowActivate={(row) => startEdit(row.id, row)}
                renderActions={(row) => (
                    <>
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Visualizar detalhes do usuário"
                            title="Visualizar detalhes"
                            leftIcon={<Eye className="size-3.5" />}
                            onClick={(event) => {
                                event.stopPropagation();
                                setSelected(row);
                            }}
                        />
                        <CrudTableActions
                            row={row}
                            showOpenTab={false}
                            onEdit={() => startEdit(row.id, row)}
                            onDelete={() => void handleDelete(row)}
                            deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                        />
                    </>
                )}
            />
            <AppUserDetailModal
                row={selected}
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
            />
        </>
    );
}
