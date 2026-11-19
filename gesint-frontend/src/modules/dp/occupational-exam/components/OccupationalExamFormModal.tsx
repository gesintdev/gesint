"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { medicalClinicKeys } from "@/modules/dp/occupational-exam/clinic/medical-clinic.query";
import { medicalClinicService } from "@/modules/dp/occupational-exam/clinic/services/medical-clinic.service";
import { OccupationalExamFormFields } from "@/modules/dp/occupational-exam/components/OccupationalExamFormFields";
import type { OccupationalExamCreateDto } from "@/modules/dp/occupational-exam/dto/occupational-exam.dto";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/dp/occupational-exam/exceptions/occupational-exam.messages";
import {
    emptyOccupationalExamFormForAdmission,
    occupationalExamToFormDto,
} from "@/modules/dp/occupational-exam/lib/occupational-exam.mapper";
import {
    OCCUPATIONAL_EXAM_ENTITY_TYPE,
    OCCUPATIONAL_EXAM_LINK_ROLE,
} from "@/modules/dp/occupational-exam/lib/occupational-exam.options";
import { occupationalExamKeys } from "@/modules/dp/occupational-exam/occupational-exam.query";
import { occupationalPhysicianKeys } from "@/modules/dp/occupational-exam/physician/occupational-physician.query";
import { occupationalPhysicianService } from "@/modules/dp/occupational-exam/physician/services/occupational-physician.service";
import { occupationalExamService } from "@/modules/dp/occupational-exam/services/occupational-exam.service";
import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { useHasPermission } from "@/shared/auth/permissions";
import { useFormDirtyByComparison } from "@/shared/components/crud/useFormDirtyByComparison";
import {
    flushPendingAttachments,
    type PendingAttachment,
} from "@/shared/components/storage/EntityAttachments";
import { Button } from "@/shared/components/ui/Button";
import { PopoverPortalProvider } from "@/shared/components/ui/input/popover-portal";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { Modal } from "@/shared/components/ui/Modal";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

type OccupationalExamFormModalProps = {
    open: boolean;
    onClose: () => void;
    collaboratorId: string;
    jobPositionId: string;
    examId?: string | null;
    onSaved?: () => void;
};

export function OccupationalExamFormModal({
    open,
    onClose,
    collaboratorId,
    jobPositionId,
    examId,
    onSaved,
}: OccupationalExamFormModalProps) {
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const formId = useId();
    const queryClient = useQueryClient();
    const canViewClinical = useHasPermission("occupationalexam:clinical");
    const isEditing = Boolean(examId);
    const [form, setForm] = useState<OccupationalExamCreateDto>(() =>
        emptyOccupationalExamFormForAdmission(collaboratorId, jobPositionId),
    );
    const [baseline, setBaseline] = useState<OccupationalExamCreateDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

    const detailQuery = useQuery({
        queryKey: occupationalExamKeys.detail(examId ?? ""),
        queryFn: () => occupationalExamService.getById(examId!),
        enabled: open && isEditing && Boolean(examId),
    });

    const clinicsQuery = useQuery({
        queryKey: medicalClinicKeys.all,
        queryFn: () => medicalClinicService.getAll(),
        enabled: open,
    });

    const physiciansQuery = useQuery({
        queryKey: occupationalPhysicianKeys.all,
        queryFn: () => occupationalPhysicianService.getAll(),
        enabled: open,
    });

    const clearPendingAttachments = useCallback(() => {
        setPendingAttachments([]);
    }, []);

    useEffect(() => {
        if (!open) return;
        if (isEditing) {
            if (detailQuery.data) {
                const next = occupationalExamToFormDto(detailQuery.data);
                next.collaboratorId = collaboratorId;
                next.jobPositionId = jobPositionId || next.jobPositionId;
                setForm(next);
                setBaseline(next);
                setError(null);
                clearPendingAttachments();
            }
            return;
        }
        const next = emptyOccupationalExamFormForAdmission(collaboratorId, jobPositionId);
        setForm(next);
        setBaseline(next);
        setError(null);
        clearPendingAttachments();
    }, [
        open,
        isEditing,
        detailQuery.data,
        collaboratorId,
        jobPositionId,
        clearPendingAttachments,
    ]);

    const isDirty = useFormDirtyByComparison(form, baseline);

    const clinicItems: SelectItem[] = (clinicsQuery.data ?? []).map((clinic) => ({
        value: clinic.id,
        label: clinic.corporateName,
    }));

    const physicianItems: SelectItem[] = (physiciansQuery.data ?? []).map((physician) => ({
        value: physician.id,
        label: `${physician.fullName} (CRM ${physician.crm}/${physician.crmState})`,
    }));

    const update = <K extends keyof OccupationalExamCreateDto>(
        field: K,
        value: OccupationalExamCreateDto[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

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

    const saveMutation = useMutation({
        mutationFn: async (dto: OccupationalExamCreateDto) => {
            const payload: OccupationalExamCreateDto = {
                ...dto,
                collaboratorId,
                jobPositionId: jobPositionId || dto.jobPositionId,
            };
            if (!canViewClinical) {
                delete payload.cid;
                delete payload.clinicalObservations;
            }
            let savedId = examId ?? null;
            if (isEditing && examId) {
                const updated = await occupationalExamService.update(examId, payload);
                savedId = updated.id;
            } else {
                const created = await occupationalExamService.create(payload);
                savedId = created.id;
            }
            if (!savedId) {
                throw new Error("Nao foi possivel identificar o registro salvo.");
            }
            await flushPendingAttachments({
                entityType: OCCUPATIONAL_EXAM_ENTITY_TYPE,
                entityId: savedId,
                linkRole: OCCUPATIONAL_EXAM_LINK_ROLE,
                items: pendingAttachments,
            });
            return savedId;
        },
        onSuccess: async (savedId) => {
            clearPendingAttachments();
            await queryClient.invalidateQueries({ queryKey: occupationalExamKeys.all });
            await queryClient.invalidateQueries({ queryKey: occupationalExamKeys.detail(savedId) });
            // A esteira deriva o ASO deste exame. Sem isso, Acompanhamento fica no cache de 60s.
            await queryClient.invalidateQueries({ queryKey: admissionprocessKeys.pipeline });
            await queryClient.invalidateQueries({
                queryKey: ["storage-links", OCCUPATIONAL_EXAM_ENTITY_TYPE, savedId],
            });
            toast.success(isEditing ? "Exame atualizado" : "Exame cadastrado");
            setBaseline(form);
            onSaved?.();
            onClose();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!collaboratorId || !(jobPositionId || form.jobPositionId) || !form.examType) {
            setError("Admissão sem cargo vinculado. Informe o cargo na admissão antes de cadastrar o exame.");
            return;
        }
        saveMutation.mutate(form);
    };

    return (
        <Modal
            open={open}
            onClose={() => void requestClose()}
            title={isEditing ? "Editar exame ocupacional" : "Novo exame ocupacional"}
            subtitle="Colaborador e cargo herdados da admissão selecionada."
            size="screen"
            dialogRef={(node) => {
                if (node !== portalRoot) setPortalRoot(node);
            }}
            footer={
                <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => void requestClose()}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </div>
            }
        >
            <PopoverPortalProvider container={portalRoot}>
                <form id={formId} onSubmit={handleSubmit}>
                    {isEditing && detailQuery.isLoading ? (
                                <div className="grid gap-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="skeleton-shimmer h-10 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <div className="gesint-form-body grid gap-6">
                                    <OccupationalExamFormFields
                                        form={form}
                                        onChange={update}
                                        clinicItems={clinicItems}
                                        physicianItems={physicianItems}
                                        examId={examId}
                                        pendingAttachments={pendingAttachments}
                                        onPendingAttachmentsChange={setPendingAttachments}
                                        hideCollaboratorAndJob
                                    />
                                    {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                                </div>
                            )}
                </form>
            </PopoverPortalProvider>
        </Modal>
    );
}
