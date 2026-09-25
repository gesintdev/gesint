"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import type { JobPositionCompetency } from "@/modules/dp/organization/jobposition/competency/dto/job-position-competency.dto";
import { JobPositionCompetencyFormModal } from "@/modules/dp/organization/jobposition/competency/components/JobPositionCompetencyFormModal";
import { jobPositionCompetencyKeys } from "@/modules/dp/organization/jobposition/competency/job-position-competency.query";
import {
    COMPETENCY_TYPE_LABELS,
    JOB_POSITION_COMPETENCY_EXPECTED_LEVEL_LABELS,
    JOB_POSITION_COMPETENCY_USAGE_LABELS,
} from "@/modules/dp/organization/jobposition/competency/lib/job-position-competency.options";
import { jobPositionCompetencyService } from "@/modules/dp/organization/jobposition/competency/services/job-position-competency.service";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import { useHasPermission } from "@/shared/auth/permissions";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ExceptionCapture } from "@/shared/exceptions";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

type CompetencyRow = JobPositionCompetency & { usedInLabel: string };

const COLUMNS: TableColumnConfig[] = [
    {
        id: "competencyName",
        columnName: "Competência",
        fieldValue: "competencyName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "competencyType",
        columnName: "Tipo",
        fieldValue: "competencyType",
        dataType: TableDataType.BADGE,
        badgeLabels: COMPETENCY_TYPE_LABELS,
    },
    {
        id: "expectedLevel",
        columnName: "Nível esperado",
        fieldValue: "expectedLevel",
        dataType: TableDataType.BADGE,
        badgeLabels: JOB_POSITION_COMPETENCY_EXPECTED_LEVEL_LABELS,
    },
    {
        id: "usedInLabel",
        columnName: "Usada em",
        fieldValue: "usedInLabel",
        dataType: TableDataType.TEXT,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
    },
    {
        id: "validFrom",
        columnName: "Vigente de",
        fieldValue: "validFrom",
        dataType: TableDataType.DATE,
    },
];

type JobPositionCompetencySectionProps = {
    jobPositionId?: string | null;
};

export function JobPositionCompetencySection({ jobPositionId }: JobPositionCompetencySectionProps) {
    const canWrite = useHasPermission("jobposition:write");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const requirementsQuery = useQuery({
        queryKey: jobPositionCompetencyKeys.byJobPosition(jobPositionId ?? ""),
        queryFn: () => jobPositionCompetencyService.findByJobPositionId(jobPositionId!),
        enabled: Boolean(jobPositionId),
    });

    const rows = useMemo<CompetencyRow[]>(() => {
        const all = requirementsQuery.data ?? [];
        return all
            .filter((row) => !row.validUntil)
            .map((row) => ({
                ...row,
                usedInLabel: (row.usedIn ?? [])
                    .map((usage) => JOB_POSITION_COMPETENCY_USAGE_LABELS[usage] ?? usage)
                    .join(" · "),
            }));
    }, [requirementsQuery.data]);

    const openCreate = () => {
        setEditingId(null);
        setModalOpen(true);
    };

    const openEdit = (row: CompetencyRow) => {
        setEditingId(row.id);
        setModalOpen(true);
    };

    const headerActions =
        canWrite && jobPositionId ? (
            <Button
                type="button"
                size="sm"
                leftIcon={<Plus className="size-4" strokeWidth={2} />}
                aria-label="Adicionar competência"
                onClick={openCreate}
            />
        ) : null;

    return (
        <FormSection
            id="competencias"
            title="Competências exigidas"
            disabled={!jobPositionId}
            headerActions={headerActions}
        >
            {!jobPositionId ? (
                <p className="text-sm text-base-content/55 sm:col-span-12">
                    Salve o cargo para vincular competências exigidas.
                </p>
            ) : requirementsQuery.isLoading ? (
                <div className="grid gap-2 sm:col-span-12">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-shimmer h-10 w-full" />
                    ))}
                </div>
            ) : requirementsQuery.isError ? (
                <p className="text-sm font-medium text-error sm:col-span-12">
                    {ExceptionCapture.displayMessage(
                        requirementsQuery.error,
                        JOBPOSITION_CLIENT_MESSAGES.COMPETENCY_LOAD_FAILED,
                    )}
                </p>
            ) : (
                <>
                    <div className="min-w-0 sm:col-span-12">
                        <DataTable
                            data={rows}
                            columns={COLUMNS}
                            rowKey="id"
                            emptyMessage="Nenhuma competência vinculada a este cargo."
                            rowActivateOn="doubleclick"
                            onRowActivate={canWrite ? openEdit : undefined}
                        />
                    </div>
                    <JobPositionCompetencyFormModal
                        open={modalOpen}
                        onClose={() => {
                            setModalOpen(false);
                            setEditingId(null);
                        }}
                        jobPositionId={jobPositionId}
                        requirementId={editingId}
                        onSaved={() => {
                            void requirementsQuery.refetch();
                        }}
                    />
                </>
            )}
        </FormSection>
    );
}
