"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import get from "lodash/get";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { JOB_VACANCY_TABLE_COLUMNS } from "@/modules/rh/person/jobvacancy/config/job-vacancy.table-columns";
import type { JobVacancy } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { JOB_VACANCY_CLIENT_MESSAGES } from "@/modules/rh/person/jobvacancy/exceptions/job-vacancy.messages";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import { useJobVacancyAdmissionProcessStore } from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryPanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { badgeClassForStatus, formatBadgeCellValue, formatCellValue } from "@/shared/lib/table/format-cell-value";
import { sortRowsByCreatedAtDesc } from "@/shared/lib/table/sort-rows-by-created-at";
import { TableDataType } from "@/shared/types/table.types";
import { SystemAlert } from "@/shared/system-alert";

function publicCareersUrl(row: JobVacancy): string | null {
    if (!row.isPublic || !row.slug?.trim()) return null;
    if (typeof window === "undefined") return `/careers/${encodeURIComponent(row.slug.trim())}`;
    return `${window.location.origin}/careers/${encodeURIComponent(row.slug.trim())}`;
}

function alignClass(align?: "left" | "center" | "right") {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
}

function renderCell(
    row: JobVacancy,
    fieldValue: string,
    dataType?: TableDataType,
    badgeLabels?: Record<string, string>,
) {
    const raw = get(row, fieldValue);
    if (dataType === TableDataType.BADGE) {
        const label = formatBadgeCellValue(raw, badgeLabels);
        return (
            <span className={clsx("gommo-badge", badgeClassForStatus(raw, badgeLabels))}>
                {label}
            </span>
        );
    }
    return formatCellValue(raw, dataType);
}

export function JobVacancyListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const selectVacancy = useJobVacancyAdmissionProcessStore((state) => state.select);
    const openDetail = useJobVacancyAdmissionProcessStore((state) => state.openDetail);

    const openEdit = (row: JobVacancy) => {
        selectVacancy({
            jobVacancyId: row.id,
            jobVacancyTitle: row.jobTitle,
        });
        startEdit(row.id, row);
    };

    const openDetailTab = (row: JobVacancy) => {
        openDetail({
            jobVacancyId: row.id,
            jobVacancyTitle: row.jobTitle,
        });
        startEdit(row.id, row);
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => jobVacancyService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobVacancyKeys.all });
            await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
            toast.success("Vaga excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: JOB_VACANCY_CLIENT_MESSAGES.JOB_VACANCY_LOAD_FAILED }),
    });

    const handleDelete = async (row: JobVacancy) => {
        if ((row.candidateCount ?? 0) > 0) {
            toast.message("Não é possível excluir uma vaga que já possui candidatos.");
            return;
        }
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPanel<JobVacancy> queryKey={jobVacancyKeys.all} request={() => jobVacancyService.getAll()}>
            {({ data }) => {
                const rows = sortRowsByCreatedAtDesc(data);
                return (
                    <div className="gommo-table-scroll">
                        <table className="gommo-table gommo-table--compact w-full">
                            <thead>
                                <tr>
                                    {JOB_VACANCY_TABLE_COLUMNS.map((col) => (
                                        <th key={col.id} className={alignClass(col.align)}>
                                            <span className="gommo-table-col-title">{col.columnName}</span>
                                        </th>
                                    ))}
                                    <th>
                                        <span className="gommo-table-col-title">Link</span>
                                    </th>
                                    <th className="text-right">
                                        <span className="gommo-table-col-title">Ações</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={JOB_VACANCY_TABLE_COLUMNS.length + 2}
                                            className="py-16 text-center text-sm text-base-content/38"
                                        >
                                            Nenhuma vaga cadastrada.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => {
                                        const count = row.candidateCount ?? 0;
                                        const url = publicCareersUrl(row);
                                        return (
                                            <tr
                                                key={row.id}
                                                className="cursor-pointer"
                                                onDoubleClick={() => openDetailTab(row)}
                                            >
                                                {JOB_VACANCY_TABLE_COLUMNS.map((col, index) => (
                                                    <td
                                                        key={col.id}
                                                        className={clsx(
                                                            alignClass(col.align),
                                                            index === 0
                                                                ? "font-medium text-base-content"
                                                                : "text-base-content/70",
                                                            col.className,
                                                        )}
                                                    >
                                                        {renderCell(
                                                            row,
                                                            col.fieldValue,
                                                            col.dataType,
                                                            col.badgeLabels,
                                                        )}
                                                    </td>
                                                ))}
                                                <td
                                                    onClick={(event) => event.stopPropagation()}
                                                    onDoubleClick={(event) => event.stopPropagation()}
                                                >
                                                    {url ? (
                                                        <div className="flex min-w-[12rem] max-w-[18rem] items-center gap-1.5">
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="truncate text-xs font-medium text-primary hover:underline"
                                                                title={url}
                                                            >
                                                                /careers/{row.slug}
                                                            </a>
                                                            <button
                                                                type="button"
                                                                className="job-vacancy-link-icon"
                                                                aria-label="Copiar link da candidatura"
                                                                title="Copiar link"
                                                                onClick={async (event) => {
                                                                    event.stopPropagation();
                                                                    try {
                                                                        await navigator.clipboard.writeText(url);
                                                                        toast.success("Link copiado");
                                                                    } catch {
                                                                        toast.error(
                                                                            "Não foi possível copiar o link.",
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <Copy className="size-3.5" strokeWidth={2} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="job-vacancy-link-icon"
                                                                aria-label="Abrir página de candidatura"
                                                                title="Abrir página"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    window.open(
                                                                        url,
                                                                        "_blank",
                                                                        "noopener,noreferrer",
                                                                    );
                                                                }}
                                                            >
                                                                <ExternalLink className="size-3.5" strokeWidth={2} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-base-content/35">—</span>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    <div
                                                        className="gommo-table-actions"
                                                        onClick={(event) => event.stopPropagation()}
                                                        onDoubleClick={(event) => event.stopPropagation()}
                                                    >
                                                        <CrudTableActions
                                                            row={row}
                                                            onEdit={() => openEdit(row)}
                                                            onDelete={() => void handleDelete(row)}
                                                            deleteLoading={
                                                                deleteMutation.isPending &&
                                                                deleteMutation.variables === row.id
                                                            }
                                                            deleteDisabled={count > 0}
                                                            deleteDisabledTitle="Não é possível excluir uma vaga que já possui candidatos."
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            }}
        </QueryPanel>
    );
}
