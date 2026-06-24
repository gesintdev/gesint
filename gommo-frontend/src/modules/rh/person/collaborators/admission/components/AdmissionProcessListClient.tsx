"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";

import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { ADMISSION_TABLE_COLUMNS } from "@/modules/rh/person/collaborators/admission/config/admission-process.table-columns";
import type { AdmissionProcess } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

type AdmissionStatusFilter = "ACTIVE" | "INACTIVE" | "ALL";
type AdmissionProfileTag = "DISMISSED" | "IN_VACATION" | "ON_LEAVE";
type AdmissionListingRow = AdmissionProcess & { admissionTags: AdmissionProfileTag[] };

const STATUS_FILTERS: Array<{ value: AdmissionStatusFilter; label: string }> = [
    { value: "ACTIVE", label: "Ativos" },
    { value: "INACTIVE", label: "Desligados" },
    { value: "ALL", label: "Todos" },
];

function admissionTags(row: AdmissionProcess): AdmissionProfileTag[] {
    const tags: AdmissionProfileTag[] = [];
    if (row.collaboratorStatus === "INACTIVE") tags.push("DISMISSED");
    if (row.inVacation) tags.push("IN_VACATION");
    if (row.onLeave) tags.push("ON_LEAVE");
    return tags;
}

function matchesStatusFilter(row: AdmissionProcess, filter: AdmissionStatusFilter) {
    if (filter === "ALL") return row.status !== "DELETED";
    if (filter === "INACTIVE") return row.collaboratorStatus === "INACTIVE";
    return row.collaboratorStatus !== "INACTIVE";
}

function admissionRowClassName(row: AdmissionListingRow) {
    if (row.collaboratorStatus === "INACTIVE") {
        return "bg-error/10 hover:!bg-error/15 dark:bg-error/15 dark:hover:!bg-error/20";
    }
    if (row.onLeave) {
        return "bg-warning/10 hover:!bg-warning/15 dark:bg-warning/15 dark:hover:!bg-warning/20";
    }
    if (row.inVacation) {
        return "bg-success/10 hover:!bg-success/15 dark:bg-success/15 dark:hover:!bg-success/20";
    }
    return undefined;
}

export function AdmissionProcessListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<AdmissionStatusFilter>("ACTIVE");
    const deleteMutation = useMutation({
        mutationFn: (id: string) => admissionprocessService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: admissionprocessKeys.all });
            toast.success("Admissão excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED }),
    });
    const handleDelete = async (row: AdmissionProcess) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-2">
            <div className="flex flex-wrap items-center gap-2 px-1 pt-3">
                {STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => setStatusFilter(filter.value)}
                        className={clsx(
                            "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                            statusFilter === filter.value
                                ? "bg-primary/12 text-primary"
                                : "bg-base-content/5 text-base-content/60 hover:bg-base-content/8",
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            <QueryTablePanel<AdmissionListingRow>
                queryKey={[...admissionprocessKeys.all, statusFilter]}
                request={async () => {
                    const rows = await admissionprocessService.getAll();
                    return rows
                        .filter((row) => matchesStatusFilter(row, statusFilter))
                        .map((row) => ({ ...row, admissionTags: admissionTags(row) }));
                }}
                columns={ADMISSION_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhuma admissão cadastrada."
                getRowClassName={admissionRowClassName}
                onRowActivate={(row) => startEdit(row.id, row)}
                renderActions={(row) => (
                    <CrudTableActions
                        row={row}
                        onEdit={() => startEdit(row.id, row)}
                        onDelete={() => void handleDelete(row)}
                        deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    />
                )}
            />
        </div>
    );
}
