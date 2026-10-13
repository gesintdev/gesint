"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { EXPERIENCE_EVALUATION_TABLE_COLUMNS } from "@/modules/rh/person/experience/config/experience-evaluation.table-columns";
import type { ExperienceEvaluation } from "@/modules/rh/person/experience/dto/experience-evaluation.dto";
import { experienceEvaluationKeys } from "@/modules/rh/person/experience/experience.query";
import { experienceEvaluationService } from "@/modules/rh/person/experience/services/experience-evaluation.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";

type ExperienceListRow = ExperienceEvaluation & {
    milestoneLabel: string;
    selectionVsExperience: string;
};

function toListRow(row: ExperienceEvaluation): ExperienceListRow {
    const selection = row.selectionAverage != null ? String(row.selectionAverage) : "—";
    const experience = row.averageScore != null ? String(row.averageScore) : "—";
    return {
        ...row,
        milestoneLabel: row.experienceMilestoneDays != null ? `${row.experienceMilestoneDays} dias` : "—",
        selectionVsExperience: `${selection} → ${experience}`,
    };
}

export function ExperienceEvaluationListClient() {
    const { startEdit } = useCrudScreen();
    const [bucket, setBucket] = useState<"open" | "decided">("open");

    const summaryQuery = useQuery({
        queryKey: experienceEvaluationKeys.summary,
        queryFn: () => experienceEvaluationService.summary(),
    });

    const dueSoon = summaryQuery.data?.dueSoonCount ?? 0;

    const toolbar = useMemo(
        () => (
            <div className="flex flex-wrap items-center gap-2">
                <div className="join">
                    <button
                        type="button"
                        className={`btn btn-sm join-item ${bucket === "open" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setBucket("open")}
                    >
                        Em período
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm join-item ${bucket === "decided" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setBucket("decided")}
                    >
                        Decididos
                    </button>
                </div>
                {dueSoon > 0 ? (
                    <span className="badge badge-warning badge-outline">
                        {dueSoon} {dueSoon === 1 ? "vence" : "vencem"} em 7 dias
                    </span>
                ) : null}
            </div>
        ),
        [bucket, dueSoon],
    );

    return (
        <div className="grid gap-3">
            {toolbar}
            <QueryPagedTablePanel<ExperienceListRow>
                queryKey={experienceEvaluationKeys.queue(bucket)}
                request={async (page, size, filters) =>
                    paginateCatalogRows(
                        (await experienceEvaluationService.listQueue(bucket)).map(toListRow),
                        page,
                        size,
                        filters,
                    )
                }
                columns={EXPERIENCE_EVALUATION_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage={
                    bucket === "open"
                        ? "Nenhum colaborador em período de experiência."
                        : "Nenhuma decisão registrada ainda."
                }
                onRowActivate={(row) => startEdit(row.id, row)}
                renderActions={(row) => (
                    <CrudTableActions row={row} onEdit={() => startEdit(row.id, row)} showOpenTab />
                )}
            />
        </div>
    );
}
