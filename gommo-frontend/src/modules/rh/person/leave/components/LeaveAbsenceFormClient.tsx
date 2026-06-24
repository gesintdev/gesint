"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { LeaveRequestCreateDto } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/rh/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { emptyLeaveRequestForm, leaverequestToFormDto } from "@/modules/rh/person/leave/lib/leave-request.mapper";
import { ABSENCE_TYPE_ITEMS } from "@/modules/rh/person/leave/lib/leave-types";
import { leaveAbsenceFormSchema } from "@/modules/rh/person/leave/schemas/leave-absence.schema";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { storageService } from "@/modules/storage/services/storage.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import {
    EntityAttachments,
    flushPendingAttachments,
    type PendingAttachment,
} from "@/shared/components/storage/EntityAttachments";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputDate, InputSelect, InputString } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";
import { sectionHasChanges } from "@/shared/lib/form-step.util";
import { mapZodFieldErrors } from "@/shared/lib/zod-field-errors";

const APPROVAL_ITEMS: SelectItem[] = [
    { value: "true", label: "Aprovado" },
    { value: "false", label: "Pendente" },
];
const LEAVE_ABSENCE_ENTITY_TYPE = "leave_request";
const FORM_STEPS: FormStepNavItem[] = [
    { id: "cadastro", label: "Ausência" },
    { id: "documentos", label: "Documentos" },
];

type LeaveFormField = keyof LeaveRequestCreateDto | "notes";

export function LeaveAbsenceFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<LeaveRequestCreateDto & { notes?: string }>(emptyLeaveRequestForm);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<LeaveFormField, string>>>({});
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
    const emptyDefaults = useMemo(() => ({ ...emptyLeaveRequestForm(), leaveType: "MEDICAL_CERTIFICATE" as const }), []);
    const detailQuery = useQuery({
        queryKey: leaverequestKeys.detail(editingId ?? ""),
        queryFn: () => leaverequestService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const attachmentsQuery = useQuery({
        queryKey: ["storage-links", LEAVE_ABSENCE_ENTITY_TYPE, editingId],
        queryFn: () => storageService.listLinks(LEAVE_ABSENCE_ENTITY_TYPE, editingId!),
        enabled: Boolean(editingId),
    });
    const clearPendingAttachments = useCallback(() => {
        setPendingAttachments([]);
    }, []);

    useEffect(() => {
        if (!isEditing) {
            setForm({ ...emptyLeaveRequestForm(), leaveType: "MEDICAL_CERTIFICATE" });
            setError(null);
            setFieldErrors({});
            clearPendingAttachments();
            return;
        }

        if (detailQuery.data) {
            setForm(leaverequestToFormDto(detailQuery.data));
            setError(null);
            setFieldErrors({});
            clearPendingAttachments();
        }
    }, [isEditing, detailQuery.data, clearPendingAttachments]);

    const saveMutation = useMutation({
        mutationFn: async (dto: LeaveRequestCreateDto) => {
            let savedId = editingId ?? null;
            if (isEditing && editingId) {
                const updated = await leaverequestService.update(editingId, dto);
                savedId = updated.id;
            } else {
                const created = await leaverequestService.create(dto);
                savedId = created.id;
            }

            if (!savedId) {
                throw new Error("Não foi possível identificar o registro salvo.");
            }

            await flushPendingAttachments({
                entityType: LEAVE_ABSENCE_ENTITY_TYPE,
                entityId: savedId,
                linkRole: "DOCUMENT",
                items: pendingAttachments,
            });
            return savedId;
        },
        onSuccess: async (savedId) => {
            clearPendingAttachments();
            await queryClient.invalidateQueries({ queryKey: leaverequestKeys.all });
            await queryClient.invalidateQueries({ queryKey: leaverequestKeys.detail(savedId) });
            await queryClient.invalidateQueries({
                queryKey: ["storage-links", LEAVE_ABSENCE_ENTITY_TYPE, savedId],
            });
            toast.success(isEditing ? "Afastamento salvo" : "Afastamento cadastrado");
            setForm({ ...emptyLeaveRequestForm(), leaveType: "MEDICAL_CERTIFICATE" });
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: LEAVE_CLIENT_MESSAGES.LEAVE_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends LeaveFormField>(field: K, value: (LeaveRequestCreateDto & { notes?: string })[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const parsed = leaveAbsenceFormSchema.safeParse(form);
        if (!parsed.success) {
            setFieldErrors(mapZodFieldErrors<LeaveFormField>(parsed.error));
            setError("Verifique os campos destacados.");
            return;
        }
        setFieldErrors({});
        saveMutation.mutate(parsed.data);
    };
    const filledStepIds = useMemo(() => {
        const filled: string[] = [];
        if (
            sectionHasChanges(form, emptyDefaults, [
                "collaboratorId",
                "leaveType",
                "startDate",
                "endDate",
                "approved",
                "notes",
            ])
        ) {
            filled.push("cadastro");
        }

        if ((attachmentsQuery.data?.length ?? 0) > 0 || pendingAttachments.length > 0) {
            filled.push("documentos");
        }
        return filled;
    }, [attachmentsQuery.data, emptyDefaults, form, pendingAttachments.length]);

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                filledStepIds,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    {isEditing ? (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    ) : null}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="cadastro" title="Ausência">
                <div className="sm:col-span-2">
                    <CollaboratorPickerField
                        value={form.collaboratorId ?? ""}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                        error={fieldErrors.collaboratorId}
                    />
                </div>
                <InputSelect
                    label="Tipo de afastamento"
                    items={ABSENCE_TYPE_ITEMS}
                    value={form.leaveType ?? ""}
                    onValueChange={(v) => update("leaveType", (v || undefined) as LeaveRequestCreateDto["leaveType"])}
                    placeholder="Selecione"
                    required
                    error={fieldErrors.leaveType}
                />
                <InputSelect
                    label="Situação"
                    items={APPROVAL_ITEMS}
                    value={form.approved === true ? "true" : form.approved === false ? "false" : ""}
                    onValueChange={(v) => update("approved", v === "true")}
                    placeholder="Selecione"
                    clearable
                />
                <InputDate
                    label="Data de início"
                    value={form.startDate ?? ""}
                    onValueChange={(v) => update("startDate", v)}
                    required
                    error={fieldErrors.startDate}
                />
                <InputDate
                    label="Data de fim"
                    value={form.endDate ?? ""}
                    onValueChange={(v) => update("endDate", v)}
                    required
                    error={fieldErrors.endDate}
                />
                <div className="sm:col-span-2">
                    <InputString
                        label="Observações"
                        value={form.notes ?? ""}
                        onValueChange={(v) => update("notes", v)}
                    />
                </div>
            </FormSection>
            <FormSection
                id="documentos"
                title="Documentos"
                description="Anexos vinculados ao afastamento."
                bodyClassName="!block"
            >
                <EntityAttachments
                    entityType={LEAVE_ABSENCE_ENTITY_TYPE}
                    entityId={editingId}
                    deferUpload
                    pendingAttachments={pendingAttachments}
                    onPendingAttachmentsChange={setPendingAttachments}
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
