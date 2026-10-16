"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";

import { OccupationalExamFormModal } from "@/modules/dp/occupational-exam/components/OccupationalExamFormModal";
import { OCCUPATIONAL_EXAM_TABLE_COLUMNS } from "@/modules/dp/occupational-exam/config/occupational-exam.table-columns";
import type { OccupationalExam } from "@/modules/dp/occupational-exam/dto/occupational-exam.dto";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/dp/occupational-exam/exceptions/occupational-exam.messages";
import { occupationalExamKeys } from "@/modules/dp/occupational-exam/occupational-exam.query";
import { occupationalExamService } from "@/modules/dp/occupational-exam/services/occupational-exam.service";
import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { useHasPermission } from "@/shared/auth/permissions";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ExceptionCapture } from "@/shared/exceptions";

const ADMISSION_EXAM_COLUMNS = OCCUPATIONAL_EXAM_TABLE_COLUMNS.filter(
    (column) => column.id !== "collaboratorName",
);

function EmptyAdmissionState() {
    return (
        <div className="flex min-h-70 items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-(--gommo-border-subtle) bg-base-100 px-5 py-6 text-center">
                <Stethoscope className="mx-auto size-8 text-primary/70" strokeWidth={1.9} />
                <h3 className="mt-3 text-sm font-semibold text-base-content">Selecione uma admissão</h3>
                <p className="mt-1 text-sm text-base-content/55">
                    Abra uma admissão para gerenciar os exames ocupacionais.
                </p>
            </div>
        </div>
    );
}

export function AdmissionOccupationalExamTab() {
    const { editingId } = useCrudScreen();
    const canWrite = useHasPermission("occupationalexam:write");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingExamId, setEditingExamId] = useState<string | null>(null);

    // Mesma query key do FormClient / Férias / Afastamento — compartilha cache.
    // refetchOnMount: GET do backend religa colaborador se collaboratorId estiver nulo.
    const admissionQuery = useQuery({
        queryKey: admissionprocessKeys.detail(editingId ?? ""),
        queryFn: () => admissionprocessService.getById(editingId!),
        enabled: Boolean(editingId),
        refetchOnMount: "always",
    });

    const collaboratorId = admissionQuery.data?.collaboratorId;
    const jobPositionId = admissionQuery.data?.jobPositionId ?? "";

    const examsQuery = useQuery({
        queryKey: [...occupationalExamKeys.all, "admission", collaboratorId ?? ""],
        queryFn: () => occupationalExamService.findByCollaboratorId(collaboratorId!),
        enabled: Boolean(collaboratorId),
    });

    const rows = useMemo(() => examsQuery.data ?? [], [examsQuery.data]);

    const openCreate = () => {
        setEditingExamId(null);
        setModalOpen(true);
    };

    const openEdit = (row: OccupationalExam) => {
        setEditingExamId(row.id);
        setModalOpen(true);
    };

    if (!editingId) {
        return <EmptyAdmissionState />;
    }

    if (admissionQuery.isLoading) {
        return (
            <SkeletonStack count={4} padded />
        );
    }

    if (admissionQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        admissionQuery.error,
                        ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED,
                    )}
                </p>
            </div>
        );
    }

    if (!collaboratorId) {
        return (
            <div className="flex min-h-70 items-center justify-center p-6">
                <div className="max-w-md rounded-xl border border-(--gommo-border-subtle) bg-base-100 px-5 py-6 text-center">
                    <Stethoscope className="mx-auto size-8 text-primary/70" strokeWidth={1.9} />
                    <h3 className="mt-3 text-sm font-semibold text-base-content">Dados incompletos</h3>
                    <p className="mt-1 text-sm text-base-content/55">
                        Salve o cadastro com nome, CPF e data de nascimento na aba Editar para liberar os
                        exames.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-[13px] font-semibold tracking-tight text-base-content">
                        Exames ocupacionais
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Exames desta admissão. Duplo clique para editar.
                    </p>
                </div>
                {canWrite ? (
                    <Button type="button" size="sm" leftIcon={<Plus className="size-3.5" />} onClick={openCreate}>
                        Novo exame
                    </Button>
                ) : null}
            </div>

            {examsQuery.isLoading ? (
                <SkeletonStack count={3} />
            ) : examsQuery.isError ? (
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        examsQuery.error,
                        OCCUPATIONAL_EXAM_CLIENT_MESSAGES.LOAD_FAILED,
                    )}
                </p>
            ) : (
                <section className="overflow-hidden rounded-xl border border-(--gommo-border-subtle) bg-base-100">
                    <DataTable<OccupationalExam>
                        data={rows}
                        columns={ADMISSION_EXAM_COLUMNS}
                        rowKey="id"
                        emptyMessage="Nenhum exame cadastrado para este colaborador."
                        rowActivateOn="doubleclick"
                        onRowActivate={canWrite ? openEdit : undefined}
                    />
                </section>
            )}

            <OccupationalExamFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingExamId(null);
                }}
                collaboratorId={collaboratorId}
                jobPositionId={jobPositionId}
                examId={editingExamId}
                onSaved={() => {
                    void examsQuery.refetch();
                }}
            />
        </div>
    );
}
