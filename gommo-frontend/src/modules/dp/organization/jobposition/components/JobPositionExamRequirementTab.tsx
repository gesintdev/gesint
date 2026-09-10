"use client";

import { useQuery } from "@tanstack/react-query";
import { ListChecks, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ExamRequirementFormModal } from "@/modules/dp/occupational-exam/exam-requirement/components/ExamRequirementFormModal";
import { EXAM_REQUIREMENT_TABLE_COLUMNS } from "@/modules/dp/occupational-exam/exam-requirement/config/exam-requirement.table-columns";
import type { ExamRequirement } from "@/modules/dp/occupational-exam/exam-requirement/dto/exam-requirement.dto";
import { examRequirementKeys } from "@/modules/dp/occupational-exam/exam-requirement/exam-requirement.query";
import { examRequirementService } from "@/modules/dp/occupational-exam/exam-requirement/services/exam-requirement.service";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/dp/occupational-exam/exceptions/occupational-exam.messages";
import { useHasPermission } from "@/shared/auth/permissions";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ExceptionCapture } from "@/shared/exceptions";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const JOB_MATRIX_COLUMNS: TableColumnConfig[] = [
    {
        id: "name",
        columnName: "Nome",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    ...EXAM_REQUIREMENT_TABLE_COLUMNS,
];

function EmptyJobPositionState() {
    return (
        <div className="flex min-h-70 items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-(--gommo-border-subtle) bg-base-100 px-5 py-6 text-center">
                <ListChecks className="mx-auto size-8 text-primary/70" strokeWidth={1.9} />
                <h3 className="mt-3 text-sm font-semibold text-base-content">Selecione um cargo</h3>
                <p className="mt-1 text-sm text-base-content/55">
                    Abra um cargo para gerenciar a matriz de exames ocupacionais.
                </p>
            </div>
        </div>
    );
}

export function JobPositionExamRequirementTab() {
    const { editingId } = useCrudScreen();
    const canWrite = useHasPermission("occupationalexam:write");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRequirementId, setEditingRequirementId] = useState<string | null>(null);

    const requirementsQuery = useQuery({
        queryKey: [...examRequirementKeys.all, "job-position", editingId ?? ""],
        queryFn: () => examRequirementService.findByJobPositionId(editingId!),
        enabled: Boolean(editingId),
    });

    const rows = useMemo(() => requirementsQuery.data ?? [], [requirementsQuery.data]);

    const openCreate = () => {
        setEditingRequirementId(null);
        setModalOpen(true);
    };

    const openEdit = (row: ExamRequirement) => {
        setEditingRequirementId(row.id);
        setModalOpen(true);
    };

    if (!editingId) {
        return <EmptyJobPositionState />;
    }

    if (requirementsQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (requirementsQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        requirementsQuery.error,
                        OCCUPATIONAL_EXAM_CLIENT_MESSAGES.REQUIREMENT_LOAD_FAILED,
                    )}
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-base-content">Matriz de exames</h3>
                    <p className="text-xs text-base-content/55">
                        Requisitos e exames complementares vinculados a este cargo.
                    </p>
                </div>
                {canWrite ? (
                    <Button type="button" size="sm" onClick={openCreate}>
                        <Plus className="size-4" strokeWidth={2} />
                        Nova matriz
                    </Button>
                ) : null}
            </div>

            <section className="min-h-0 flex-1 overflow-auto">
                <DataTable
                    data={rows}
                    columns={JOB_MATRIX_COLUMNS}
                    rowKey="id"
                    emptyMessage="Nenhuma matriz cadastrada para este cargo."
                    rowActivateOn="doubleclick"
                    onRowActivate={canWrite ? openEdit : undefined}
                />
            </section>

            <ExamRequirementFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingRequirementId(null);
                }}
                jobPositionId={editingId}
                requirementId={editingRequirementId}
                onSaved={() => {
                    void requirementsQuery.refetch();
                }}
            />
        </div>
    );
}
