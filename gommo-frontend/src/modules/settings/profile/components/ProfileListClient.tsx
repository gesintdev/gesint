"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PROFILE_TABLE_COLUMNS } from "@/modules/settings/profile/config/profile.table-columns";
import type { Profile, SystemScope } from "@/modules/settings/profile/dto/profile.dto";
import { profileKeys } from "@/modules/settings/profile/profile.query";
import { profileService } from "@/modules/settings/profile/services/profile.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";
import clsx from "clsx";

const SYSTEM_FILTERS: Array<{ value: SystemScope | "ALL"; label: string }> = [
    { value: "ALL", label: "Todos" },
    { value: "DP", label: "DP" },
    { value: "RH", label: "RH" },
];

export function ProfileListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [systemFilter, setSystemFilter] = useState<SystemScope | "ALL">("ALL");

    const deleteMutation = useMutation({
        mutationFn: (id: string) => profileService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: profileKeys.all });
            toast.success("Perfil excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível excluir o perfil." }),
    });

    const handleDelete = async (row: Profile) => {
        if (!(await SystemAlert.confirmDelete("Deseja excluir este perfil? Usuários vinculados perderão estas permissões."))) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-2">
            <div className="flex flex-wrap items-center gap-2 px-1 pt-3">
                {SYSTEM_FILTERS.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => setSystemFilter(filter.value)}
                        className={clsx(
                            "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                            systemFilter === filter.value
                                ? "bg-primary/12 text-primary"
                                : "bg-base-content/5 text-base-content/60 hover:bg-base-content/8",
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            <QueryTablePanel<Profile>
                queryKey={profileKeys.list(systemFilter === "ALL" ? undefined : systemFilter)}
                request={() =>
                    profileService.getAll(systemFilter === "ALL" ? undefined : systemFilter)
                }
                columns={PROFILE_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhum perfil cadastrado."
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
        </div>
    );
}
