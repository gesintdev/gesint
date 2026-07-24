"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Check, PauseCircle} from "lucide-react";
import {toast} from "sonner";

import {PROFILE_TABLE_COLUMNS} from "@/modules/cfg/settings/profile/config/profile.table-columns";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {paginateProfiles} from "@/modules/cfg/settings/profile/lib/profile.filters";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {QueryPagedTablePanel} from "@/shared/components/data/DataPanel";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

export function ProfileListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => profileService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: profileKeys.all});
            toast.success("Perfil excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível excluir o perfil."}),
    });
    const activateMutation = useMutation({
        mutationFn: (id: string) => profileService.activate(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: profileKeys.all});
            toast.success("Perfil ativado");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: "Nao foi possivel ativar o perfil."}),
    });
    const deactivateMutation = useMutation({
        mutationFn: (id: string) => profileService.deactivate(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: profileKeys.all});
            toast.success("Perfil inativado");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: "Nao foi possivel inativar o perfil."}),
    });
    const handleDelete = async (row: Profile) => {
        if (
            !(await SystemAlert.confirmDelete(
                "Deseja excluir este perfil? Usuários vinculados perderão estas permissões.",
            ))
        )
            return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<Profile>
            queryKey={profileKeys.list()}
            request={async (page, size, filters) => {
                const rows = await profileService.getAll(undefined, true);
                const visible = rows.filter((row) => row.status !== "DELETED");
                return paginateProfiles(visible, page, size, filters);
            }}
            columns={PROFILE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum perfil cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <div className="flex items-center gap-0.5">
                    <CrudTableActions
                        row={row}
                        showOpenTab={false}
                        onEdit={() => startEdit(row.id, row)}
                        onDelete={() => void handleDelete(row)}
                        deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    />
                    {row.status === "INACTIVE" ? (
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Ativar perfil"
                            leftIcon={<Check className="size-3.5"/>}
                            loading={activateMutation.isPending && activateMutation.variables === row.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                activateMutation.mutate(row.id);
                            }}
                        />
                    ) : row.status === "ACTIVE" ? (
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Inativar perfil"
                            leftIcon={<PauseCircle className="size-3.5"/>}
                            loading={deactivateMutation.isPending && deactivateMutation.variables === row.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                deactivateMutation.mutate(row.id);
                            }}
                        />
                    ) : null}
                </div>
            )}
        />
    );
}
