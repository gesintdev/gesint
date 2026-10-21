"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";

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

type ExperienceBucket = "open" | "decided";

const BUCKET_TABS: { value: ExperienceBucket; label: string }[] = [
    { value: "open", label: "Em período" },
    { value: "decided", label: "Decididos" },
];

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
    const [bucket, setBucket] = useState<ExperienceBucket>("open");

    const summaryQuery = useQuery({
        queryKey: experienceEvaluationKeys.summary,
        queryFn: () => experienceEvaluationService.summary(),
    });

    const dueSoon = summaryQuery.data?.dueSoonCount ?? 0;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* Alinha com o padding do QueryPagedTablePanel (p-1.5) e usa o padrão de abas do CRUD. */}
            <div className="px-1.5">
                <div
                    className="gesint-crud-tablist !px-1"
                    role="tablist"
                    aria-label="Fila de experiência"
                >
                    {BUCKET_TABS.map((tab) => {
                        const selected = bucket === tab.value;
                        return (
                            <button
                                key={tab.value}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                className={clsx(
                                    "gesint-crud-tab",
                                    selected && "gesint-crud-tab--active",
                                )}
                                onClick={() => setBucket(tab.value)}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                    {dueSoon > 0 ? (
                        <span className="badge badge-warning badge-outline ml-auto self-center text-[0.6875rem]">
                            {dueSoon} {dueSoon === 1 ? "vence" : "vencem"} em 7 dias
                        </span>
                    ) : null}
                </div>
            </div>

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
