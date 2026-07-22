"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { admissionProcessKanbanColumnKeys } from "@/modules/cfg/settings/admissionprocesskanban/admission-process-kanban-column.query";
import { admissionProcessKanbanColumnService } from "@/modules/cfg/settings/admissionprocesskanban/services/admission-process-kanban-column.service";
import { CandidateAnalysisModal } from "@/modules/rh/person/jobvacancy/components/CandidateAnalysisModal";
import type { JobVacancyApplication } from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { ExceptionCapture } from "@/shared/exceptions";
import { formatCpf, formatCellValue } from "@/shared/lib/table/format-cell-value";
import { TableDataType } from "@/shared/types/table.types";

type JobVacancyCandidatesPanelProps = {
    jobVacancyId: string;
};

function FieldCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.04em] text-base-content/40">
                {label}
            </span>
            <span className="mx-0.5 text-base-content/25">:</span>
            <span className="text-xs text-base-content/75">{value}</span>
        </div>
    );
}

export function JobVacancyCandidatesPanel({ jobVacancyId }: JobVacancyCandidatesPanelProps) {
    const [analysisCandidateId, setAnalysisCandidateId] = useState<string | null>(null);
    const query = useQuery({
        queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId),
        queryFn: () => jobVacancyApplicationService.getByVacancy(jobVacancyId),
    });
    const columnsQuery = useQuery({
        queryKey: admissionProcessKanbanColumnKeys.all,
        queryFn: () => admissionProcessKanbanColumnService.getAll(),
    });

    const columnNameByKey = useMemo(() => {
        const map = new Map<string, string>();
        for (const column of columnsQuery.data ?? []) {
            if (column.status === "DELETED") continue;
            map.set(column.columnKey, column.name);
        }
        return map;
    }, [columnsQuery.data]);

    const openAnalysis = (row: JobVacancyApplication) => {
        if (!row.candidateId) return;
        setAnalysisCandidateId(row.candidateId);
    };

    const situationLabel = (row: JobVacancyApplication): string => {
        const key = row.kanbanColumnKey?.trim();
        if (!key) return "Não iniciado";
        return columnNameByKey.get(key) ?? key;
    };

    if (query.isLoading) {
        return (
            <div className="grid gap-2 p-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-8 w-full" />
                ))}
            </div>
        );
    }

    if (query.isError) {
        return (
            <p className="px-3 py-4 text-sm text-error">
                {ExceptionCapture.displayMessage(query.error, "Não foi possível carregar os candidatos.")}
            </p>
        );
    }

    const rows = query.data ?? [];
    if (rows.length === 0) {
        return <p className="px-3 py-4 text-sm text-base-content/45">Nenhum candidato nesta vaga.</p>;
    }

    return (
        <>
            <div className="job-vacancy-candidates-scroll">
                <div className="job-vacancy-candidates-grid">
                    {rows.map((row) => (
                        <div
                            key={row.id}
                            className="job-vacancy-candidates-grid__row"
                            onDoubleClick={() => openAnalysis(row)}
                        >
                            <div className="min-w-0 truncate text-xs font-semibold text-base-content">
                                {row.candidateFullName ?? "—"}
                            </div>
                            <FieldCell
                                label="CPF"
                                value={row.candidateCpf ? formatCpf(row.candidateCpf) : "—"}
                            />
                            <FieldCell label="E-mail" value={row.candidateEmail ?? "—"} />
                            <FieldCell label="Situação" value={situationLabel(row)} />
                            <FieldCell
                                label="Candidatura"
                                value={formatCellValue(row.appliedAt, TableDataType.DATETIME)}
                            />
                            <div
                                className="gommo-table-actions justify-end"
                                onClick={(event) => event.stopPropagation()}
                                onDoubleClick={(event) => event.stopPropagation()}
                            >
                                <TableActionButton
                                    actionVariant="open"
                                    aria-label="Analisar candidato"
                                    title="Analisar candidato"
                                    leftIcon={<Eye className="size-3.5" />}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        openAnalysis(row);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CandidateAnalysisModal
                open={Boolean(analysisCandidateId)}
                candidateId={analysisCandidateId}
                onClose={() => setAnalysisCandidateId(null)}
            />
        </>
    );
}
