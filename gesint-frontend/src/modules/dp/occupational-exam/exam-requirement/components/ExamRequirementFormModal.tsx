"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { ExamRequirementFormFields } from "@/modules/dp/occupational-exam/exam-requirement/components/ExamRequirementFormFields";
import type { ExamRequirementCreateDto } from "@/modules/dp/occupational-exam/exam-requirement/dto/exam-requirement.dto";
import { examRequirementKeys } from "@/modules/dp/occupational-exam/exam-requirement/exam-requirement.query";
import {
    emptyExamRequirementForm,
    examRequirementToFormDto,
    examRequirementToRequestDto,
} from "@/modules/dp/occupational-exam/exam-requirement/lib/exam-requirement.mapper";
import { examRequirementService } from "@/modules/dp/occupational-exam/exam-requirement/services/exam-requirement.service";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/dp/occupational-exam/exceptions/occupational-exam.messages";
import { useFormDirtyByComparison } from "@/shared/components/crud/useFormDirtyByComparison";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

type ExamRequirementFormModalProps = {
    open: boolean;
    onClose: () => void;
    jobPositionId: string;
    requirementId?: string | null;
    onSaved?: () => void;
};

export function ExamRequirementFormModal({
    open,
    onClose,
    jobPositionId,
    requirementId,
    onSaved,
}: ExamRequirementFormModalProps) {
    const formId = useId();
    const queryClient = useQueryClient();
    const isEditing = Boolean(requirementId);
    const [form, setForm] = useState<ExamRequirementCreateDto>(() =>
        emptyExamRequirementForm(jobPositionId),
    );
    const [baseline, setBaseline] = useState<ExamRequirementCreateDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [versionNumber, setVersionNumber] = useState<number | undefined>();

    const detailQuery = useQuery({
        queryKey: examRequirementKeys.detail(requirementId ?? ""),
        queryFn: () => examRequirementService.getById(requirementId!),
        enabled: open && isEditing && Boolean(requirementId),
    });

    useEffect(() => {
        if (!open) return;
        if (isEditing) {
            if (detailQuery.data) {
                const next = examRequirementToFormDto(detailQuery.data);
                next.jobPositionId = jobPositionId;
                setForm(next);
                setBaseline(next);
                setVersionNumber(detailQuery.data.versionNumber);
                setError(null);
            }
            return;
        }
        const next = emptyExamRequirementForm(jobPositionId);
        setForm(next);
        setBaseline(next);
        setVersionNumber(undefined);
        setError(null);
    }, [open, isEditing, detailQuery.data, jobPositionId]);

    const isDirty = useFormDirtyByComparison(form, baseline);

    const saveMutation = useMutation({
        mutationFn: async (dto: ExamRequirementCreateDto) => {
            const payload = examRequirementToRequestDto({ ...dto, jobPositionId });
            if (isEditing && requirementId) return examRequirementService.update(requirementId, payload);
            return examRequirementService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: examRequirementKeys.all });
            if (requirementId) {
                await queryClient.invalidateQueries({
                    queryKey: examRequirementKeys.detail(requirementId),
                });
            }
            toast.success(isEditing ? "Nova versao da matriz criada" : "Matriz cadastrada");
            onSaved?.();
            onClose();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.REQUIREMENT_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = useCallback(
        <K extends keyof ExamRequirementCreateDto>(field: K, value: ExamRequirementCreateDto[K]) => {
            setForm((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const requestClose = async () => {
        if (isDirty) {
            const confirmed = await SystemAlert.confirm({
                title: "Alterações não salvas",
                message: "Os dados não salvos serão perdidos. Deseja continuar?",
                confirmLabel: "Continuar",
                cancelLabel: "Cancelar",
                variant: "warning",
            });
            if (!confirmed) return;
        }
        onClose();
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!jobPositionId) {
            setError("Cargo nao identificado.");
            return;
        }
        if (!form.examType) {
            setError("Selecione o tipo de exame.");
            return;
        }
        if (!form.validFrom) {
            setError("Informe a data de inicio da vigencia.");
            return;
        }
        if (form.examType === "PERIODICO" && (!form.periodicityMonths || form.periodicityMonths <= 0)) {
            setError("Informe a periodicidade em meses para exame periodico.");
            return;
        }
        saveMutation.mutate(form);
    };

    return (
        <Modal
            open={open}
            onClose={() => void requestClose()}
            title={isEditing ? "Editar matriz de exames" : "Nova matriz de exames"}
            subtitle="Cargo herdado do cadastro selecionado."
            size="screen"
            footer={
                <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => void requestClose()}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} loading={saveMutation.isPending}>
                        {isEditing ? "Criar nova versao" : "Cadastrar"}
                    </Button>
                </div>
            }
        >
            <form id={formId} onSubmit={handleSubmit}>
                    {isEditing && detailQuery.isLoading ? (
                        <div className="grid gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="skeleton-shimmer h-10 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="gesint-form-body grid gap-6">
                            <ExamRequirementFormFields
                                form={form}
                                onChange={update}
                                versionNumber={versionNumber}
                                isEditing={isEditing}
                            />
                            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                        </div>
                    )}
                </form>
        </Modal>
    );
}
