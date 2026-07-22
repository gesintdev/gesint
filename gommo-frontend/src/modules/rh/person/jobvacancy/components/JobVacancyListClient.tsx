"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import get from "lodash/get";
import { ChevronDown, KanbanSquare } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

import { JobVacancyCandidatesPanel } from "@/modules/rh/person/jobvacancy/components/JobVacancyCandidatesPanel";
import { JOB_VACANCY_TABLE_COLUMNS } from "@/modules/rh/person/jobvacancy/config/job-vacancy.table-columns";
import type { JobVacancy } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { JOB_VACANCY_CLIENT_MESSAGES } from "@/modules/rh/person/jobvacancy/exceptions/job-vacancy.messages";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import { useJobVacancyAdmissionProcessStore } from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { hasPermission, useSessionPermissions } from "@/shared/auth/permissions";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryPanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { badgeClassForStatus, formatBadgeCellValue, formatCellValue } from "@/shared/lib/table/format-cell-value";
import { TableDataType } from "@/shared/types/table.types";
import { SystemAlert } from "@/shared/system-alert";

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
    const permissions = useSessionPermissions();
    const canStartAdmission = hasPermission(permissions, "admission:read");
    const openJobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);
    const startAdmissionProcess = useJobVacancyAdmissionProcessStore((state) => state.start);
    const [expandedId, setExpandedId] = useState<string | null>(null);

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

    const startProcessMutation = useMutation({
        mutationFn: (row: JobVacancy) => jobVacancyApplicationService.startAdmissionProcess(row.id),
        onSuccess: async (_data, row) => {
            await queryClient.invalidateQueries({
                queryKey: jobVacancyApplicationKeys.byVacancy(row.id),
            });
            await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
            startAdmissionProcess({
                jobVacancyId: row.id,
                jobVacancyTitle: row.jobTitle,
            });
            toast.success("Processo de admissão iniciado");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível iniciar o processo de admissão desta vaga.",
            }),
    });

    const handleDelete = async (row: JobVacancy) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    const toggleExpand = (rowId: string) => {
        setExpandedId((current) => (current === rowId ? null : rowId));
    };

    return (
        <QueryPanel<JobVacancy> queryKey={jobVacancyKeys.all} request={() => jobVacancyService.getAll()}>
            {({ data }) => (
                <div className="gommo-table-scroll">
                    <table className="gommo-table w-full">
                        <thead>
                            <tr>
                                <th className="w-10">
                                    <span className="sr-only">Expandir</span>
                                </th>
                                {JOB_VACANCY_TABLE_COLUMNS.map((col) => (
                                    <th key={col.id} className={alignClass(col.align)}>
                                        <span className="gommo-table-col-title">{col.columnName}</span>
                                    </th>
                                ))}
                                <th className="text-center">
                                    <span className="gommo-table-col-title">Candidatos</span>
                                </th>
                                <th className="text-right">
                                    <span className="gommo-table-col-title">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={JOB_VACANCY_TABLE_COLUMNS.length + 3}
                                        className="py-16 text-center text-sm text-base-content/38"
                                    >
                                        Nenhuma vaga cadastrada.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row) => {
                                    const expanded = expandedId === row.id;
                                    const count = row.candidateCount ?? 0;
                                    const starting =
                                        startProcessMutation.isPending &&
                                        startProcessMutation.variables?.id === row.id;
                                    return (
                                        <Fragment key={row.id}>
                                            <tr
                                                className="cursor-pointer"
                                                onDoubleClick={() => startEdit(row.id, row)}
                                            >
                                                <td
                                                    className="w-10"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleExpand(row.id);
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="inline-flex size-7 items-center justify-center rounded-md text-base-content/55 transition hover:bg-base-content/5 hover:text-base-content"
                                                        aria-expanded={expanded}
                                                        aria-label={
                                                            expanded
                                                                ? "Recolher candidatos"
                                                                : "Expandir candidatos"
                                                        }
                                                    >
                                                        <ChevronDown
                                                            className={clsx(
                                                                "size-4 transition-transform",
                                                                expanded && "rotate-180",
                                                            )}
                                                        />
                                                    </button>
                                                </td>
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
                                                <td className="text-center">
                                                    <span className="inline-flex min-w-7 items-center justify-center rounded-md border border-base-content/10 bg-base-content/5 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-base-content/75">
                                                        {count}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <div
                                                        className="gommo-table-actions"
                                                        onClick={(event) => event.stopPropagation()}
                                                        onDoubleClick={(event) => event.stopPropagation()}
                                                    >
                                                        {canStartAdmission ? (
                                                            <TableActionButton
                                                                actionVariant="open"
                                                                aria-label="Abrir processo de admissão"
                                                                title="Abrir processo de admissão"
                                                                leftIcon={<KanbanSquare className="size-3.5" />}
                                                                loading={starting}
                                                                disabled={count === 0 || starting}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    if (count === 0) {
                                                                        toast.message(
                                                                            "Esta vaga não possui candidatos.",
                                                                        );
                                                                        return;
                                                                    }
                                                                    // Vaga já aberta na aba de processo: só foca a aba, sem reload/API.
                                                                    if (openJobVacancyId === row.id) {
                                                                        startAdmissionProcess({
                                                                            jobVacancyId: row.id,
                                                                            jobVacancyTitle: row.jobTitle,
                                                                        });
                                                                        return;
                                                                    }
                                                                    startProcessMutation.mutate(row);
                                                                }}
                                                            />
                                                        ) : null}
                                                        <CrudTableActions
                                                            row={row}
                                                            onEdit={() => startEdit(row.id, row)}
                                                            onDelete={() => void handleDelete(row)}
                                                            deleteLoading={
                                                                deleteMutation.isPending &&
                                                                deleteMutation.variables === row.id
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            {expanded ? (
                                                <tr className="job-vacancy-expand-row">
                                                    <td
                                                        colSpan={JOB_VACANCY_TABLE_COLUMNS.length + 3}
                                                        className="!p-0"
                                                    >
                                                        <div className="border-t border-base-content/8 bg-base-content/[0.02] px-2 py-2">
                                                            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-base-content/45">
                                                                Candidatos ({count})
                                                            </p>
                                                            <JobVacancyCandidatesPanel jobVacancyId={row.id} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </QueryPanel>
    );
}
