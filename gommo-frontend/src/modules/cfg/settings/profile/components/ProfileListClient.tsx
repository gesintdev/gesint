"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {useEffect} from "react";
import {toast} from "sonner";

import {PROFILE_TABLE_COLUMNS} from "@/modules/cfg/settings/profile/config/profile.table-columns";
import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {paginateProfiles} from "@/modules/cfg/settings/profile/lib/profile.filters";
import {clearAllProfileFormDrafts} from "@/modules/cfg/settings/profile/lib/profile-form-draft";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {useCrudStatusActions} from "@/shared/components/crud/useCrudStatusActions";
import {QueryPagedTablePanel} from "@/shared/components/data/DataPanel";
import {ExceptionCapture} from "@/shared/exceptions";
import {CATALOG_STATUS_INITIAL_FILTERS} from "@/shared/lib/table/paginate-catalog-rows";
import {SystemAlert} from "@/shared/system-alert";
import {registerTabCloseHandler} from "@/shared/workspace/dirty-tab-guard";
import {useWorkspaceTabOptional} from "@/shared/workspace/WorkspaceTabContext";

function isEditable(profile: Profile): boolean {
    return profile.editable ?? profile.roleType !== "ADMIN";
}

export function ProfileListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const workspaceTab = useWorkspaceTabOptional();
    const {data: session} = useSession();
    const tenantSlug = session?.tenantSlug?.trim() || "default";
    const username = session?.user?.username?.trim() || session?.user?.email?.trim() || "anonymous";
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service: profileService,
        queryKey: profileKeys.all,
        entityLabel: "Perfil",
    });

    useEffect(() => {
        const tabId = workspaceTab?.tab.id;
        if (!tabId) return;
        return registerTabCloseHandler(tabId, () => {
            clearAllProfileFormDrafts(tenantSlug, username);
        });
    }, [tenantSlug, username, workspaceTab?.tab.id]);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => profileService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: profileKeys.all});
            toast.success("Perfil excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível excluir o perfil."}),
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
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await profileService.getAll(undefined, true);
                const visible = rows.filter((row) => row.status !== "DELETED");
                return paginateProfiles(visible, page, size, filters);
            }}
            columns={PROFILE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum perfil cadastrado."
            onRowActivate={(row) => {
                startEdit(row.id, row);
            }}
            renderActions={(row) =>
                isEditable(row) ? (
                    <CrudTableActions
                        row={row}
                        showOpenTab={false}
                        onEdit={() => startEdit(row.id, row)}
                        onDelete={() => void handleDelete(row)}
                        onActivate={() => handleActivate(row.id)}
                        onDeactivate={() => void handleDeactivate(row.id)}
                        deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                        activateLoading={activateMutation.isPending && activateMutation.variables === row.id}
                        deactivateLoading={deactivateMutation.isPending && deactivateMutation.variables === row.id}
                    />
                ) : (
                    <CrudTableActions
                        row={row}
                        showOpenTab={false}
                        editAriaLabel="Visualizar"
                        onEdit={() => startEdit(row.id, row)}
                    />
                )
            }
        />
    );
}
