"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";

import { admissionProcessKanbanColumnKeys } from "@/modules/cfg/settings/admissionprocesskanban/admission-process-kanban-column.query";
import { admissionProcessKanbanColumnService } from "@/modules/cfg/settings/admissionprocesskanban/services/admission-process-kanban-column.service";
import { CandidateAnalysisModal } from "@/modules/rh/person/jobvacancy/components/CandidateAnalysisModal";
import { CandidateMatchScoreTag } from "@/modules/rh/person/jobvacancy/components/CandidateMatchScoreTag";
import {
    applicationAiScore,
    isApplicationAiPending,
} from "@/modules/rh/person/jobvacancy/lib/application-match-score";
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

type AnalysisTarget = {
    candidateId: string;
    applicationId: string;
    candidateName?: string;
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
    const [analysisTarget, setAnalysisTarget] = useState<AnalysisTarget | null>(null);
    const query = useQuery({
        queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId),
        queryFn: () => jobVacancyApplicationService.getByVacancy(jobVacancyId),
        refetchInterval: (current) => {
            const rows = current.state.data ?? [];
            return rows.some((row) => isApplicationAiPending(row)) ? 4000 : false;
        },
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
        setAnalysisTarget({
            candidateId: row.candidateId,
            applicationId: row.id,
            candidateName: row.candidateFullName,
        });
    };

    const situationLabel = (row: JobVacancyApplication): string => {
        const key = row.kanbanColumnKey?.trim();
        if (!key) return "Não iniciado";
        return columnNameByKey.get(key) ?? key;
    };

    const rows = useMemo(() => {
        const list = query.data ?? [];
        return [...list]
            .map((row) => ({
                row,
                score: applicationAiScore(row),
                pending: isApplicationAiPending(row),
                hasCurriculum: Boolean(row.aiAnalysis?.hasCurriculum),
            }))
            .sort((a, b) => {
                if (a.hasCurriculum !== b.hasCurriculum) return a.hasCurriculum ? -1 : 1;
                return (b.score ?? -1) - (a.score ?? -1);
            });
    }, [query.data]);

    if (query.isLoading) {
        return (
            <SkeletonStack count={3} padded="sm" rowClassName="h-8" />
        );
    }

    if (query.isError) {
        return (
            <p className="px-3 py-4 text-sm text-error">
                {ExceptionCapture.displayMessage(query.error, "Não foi possível carregar os candidatos.")}
            </p>
        );
    }

    if (rows.length === 0) {
        return <p className="px-3 py-4 text-sm text-base-content/45">Nenhum candidato nesta vaga.</p>;
    }

    return (
        <>
            <div className="job-vacancy-candidates-scroll">
                <div className="job-vacancy-candidates-grid">
                    {rows.map(({ row, score, pending }) => (
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
                            <div className="flex justify-center">
                                <CandidateMatchScoreTag score={score} pending={pending} />
                            </div>
                            <div
                                className="gommo-table-actions justify-end"
                                onClick={(event) => event.stopPropagation()}
                                onDoubleClick={(event) => event.stopPropagation()}
                            >
                                <TableActionButton
                                    actionVariant="open"
                                    aria-label="Ver perfil do candidato"
                                    title="Ver perfil"
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
                open={Boolean(analysisTarget)}
                candidateId={analysisTarget?.candidateId ?? null}
                applicationId={analysisTarget?.applicationId ?? null}
                candidateName={analysisTarget?.candidateName ?? null}
                jobVacancyId={jobVacancyId}
                onClose={() => setAnalysisTarget(null)}
            />
        </>
    );
}
