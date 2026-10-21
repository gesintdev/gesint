"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { PopoverPortalProvider } from "@/shared/components/ui/input/popover-portal";
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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const queryClient = useQueryClient();
    const isEditing = Boolean(requirementId);
    const [mounted, setMounted] = useState(false);
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
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !mounted) return;
        if (open) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open, mounted]);

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

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={(node) => {
                dialogRef.current = node;
                if (node !== portalRoot) setPortalRoot(node);
            }}
            className="modal"
            onCancel={(event) => {
                event.preventDefault();
                void requestClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    void requestClose();
                }
            }}
        >
            <PopoverPortalProvider container={portalRoot}>
                <div className="modal-box flex h-[95vh] w-[95vw] max-w-[95vw] flex-col gap-0 overflow-hidden p-0">
                    <div className="flex items-start justify-between gap-3 border-b border-base-content/8 px-5 py-4">
                        <div>
                            <h3 className="text-base font-semibold text-base-content">
                                {isEditing ? "Editar matriz de exames" : "Nova matriz de exames"}
                            </h3>
                            <p className="mt-0.5 text-xs text-base-content/50">
                                Cargo herdado do cadastro selecionado.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="gesint-btn gesint-btn--ghost gesint-btn--icon-only shrink-0 text-base-content/50"
                            aria-label="Fechar"
                            onClick={() => void requestClose()}
                        >
                            <X className="size-4" strokeWidth={2} />
                        </button>
                    </div>

                    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
                        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
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
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-base-content/8 px-5 py-3">
                            <Button type="button" variant="ghost" onClick={() => void requestClose()}>
                                Cancelar
                            </Button>
                            <Button type="submit" loading={saveMutation.isPending}>
                                {isEditing ? "Criar nova versao" : "Cadastrar"}
                            </Button>
                        </div>
                    </form>
                </div>
                <button
                    type="button"
                    className="modal-backdrop"
                    aria-label="Fechar modal"
                    onClick={() => void requestClose()}
                />
            </PopoverPortalProvider>
        </dialog>,
        document.body,
    );
}
