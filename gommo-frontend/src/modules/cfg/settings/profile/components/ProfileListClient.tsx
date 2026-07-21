"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {Check, PauseCircle} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";

import {PROFILE_TABLE_COLUMNS} from "@/modules/cfg/settings/profile/config/profile.table-columns";
import type {Profile, SystemScope} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {QueryTablePanel} from "@/shared/components/data/DataPanel";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

const SYSTEM_FILTERS: Array<{ value: SystemScope | "ALL"; label: string }> = [
    {value: "ALL", label: "Todos"},
    {value: "DP", label: "DP"},
    {value: "RH", label: "RH"},
    {value: "CONTABILIDADE", label: "CTB"},
];
const STATUS_FILTERS: Array<{ value: "ACTIVE" | "INACTIVE" | "ALL"; label: string }> = [
    {value: "ACTIVE", label: "Ativos"},
    {value: "INACTIVE", label: "Inativos"},
    {value: "ALL", label: "Todos"},
];

export function ProfileListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const [systemFilter, setSystemFilter] = useState<SystemScope | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "INACTIVE" | "ALL">("ACTIVE");
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
                <span className="mx-1 h-4 w-px bg-base-content/15"/>
                {STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => setStatusFilter(filter.value)}
                        className={clsx(
                            "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                            statusFilter === filter.value
                                ? "bg-secondary/15 text-secondary"
                                : "bg-base-content/5 text-base-content/60 hover:bg-base-content/8",
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            <QueryTablePanel<Profile>
                queryKey={profileKeys.list(systemFilter === "ALL" ? undefined : systemFilter, statusFilter)}
                request={async () => {
                    const includeInactive = statusFilter !== "ACTIVE";
                    const rows = await profileService.getAll(
                        systemFilter === "ALL" ? undefined : systemFilter,
                        includeInactive,
                    );
                    return rows.filter((row) => {
                        if (statusFilter === "ALL") return row.status !== "DELETED";
                        return row.status === statusFilter;
                    });
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
        </div>
    );
}
