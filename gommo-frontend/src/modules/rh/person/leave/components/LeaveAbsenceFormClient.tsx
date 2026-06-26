"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { LeaveRequestCreateDto } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/rh/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { emptyLeaveRequestForm, leaverequestToFormDto } from "@/modules/rh/person/leave/lib/leave-request.mapper";
import {
    ABSENCE_TYPE_ITEMS,
    LEAVE_ABSENCE_STATUS_ITEMS,
} from "@/modules/rh/person/leave/lib/leave-types";
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
import { InputDate, InputInfo, InputNumber, InputSelect, InputString } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";
import { sectionHasChanges } from "@/shared/lib/form-step.util";
import { mapZodFieldErrors } from "@/shared/lib/zod-field-errors";

const YES_NO_ITEMS: SelectItem[] = [
    { value: "true", label: "Sim" },
    { value: "false", label: "Nao" },
];

const LEAVE_ABSENCE_ENTITY_TYPE = "leave_request";
const FORM_STEPS: FormStepNavItem[] = [
    { id: "cadastro", label: "Afastamento" },
    { id: "atestado", label: "Atestado" },
    { id: "impactos", label: "Impactos" },
    { id: "documentos", label: "Documentos" },
];

type LeaveFormField = keyof LeaveRequestCreateDto | "notes";

function emptyLeaveAbsenceForm(): LeaveRequestCreateDto {
    return {
        ...emptyLeaveRequestForm(),
        leaveType: "MEDICAL_CERTIFICATE",
        absenceStatus: "VALIDATED",
        approved: true,
    };
}

function inclusiveDays(startDate?: string, endDate?: string) {
    if (!startDate || !endDate || endDate < startDate) return undefined;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return days > 0 ? days : undefined;
}

export function LeaveAbsenceFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<LeaveRequestCreateDto & { notes?: string }>(emptyLeaveRequestForm);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<LeaveFormField, string>>>({});
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
    const emptyDefaults = useMemo(() => emptyLeaveAbsenceForm(), []);
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
            setForm(emptyLeaveAbsenceForm());
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
                throw new Error("Nao foi possivel identificar o registro salvo.");
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
            setForm(emptyLeaveAbsenceForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: LEAVE_CLIENT_MESSAGES.LEAVE_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends LeaveFormField>(field: K, value: (LeaveRequestCreateDto & { notes?: string })[K]) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "startDate" || field === "endDate") {
                const durationDays = inclusiveDays(next.startDate, next.endDate);
                next.durationDays = durationDays;
                if (durationDays && durationDays > 15) {
                    next.requiresInss = true;
                }
            }
            if (field === "cid" && typeof value === "string") {
                next.cid = value.toUpperCase();
            }
            if (field === "leaveType" && value === "OCCUPATIONAL_ACCIDENT") {
                next.workAccidentStability = true;
            }
            return next;
        });
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
        const durationDays = inclusiveDays(form.startDate, form.endDate);
        const payload = {
            ...form,
            durationDays,
            requiresInss: Boolean(form.requiresInss || (durationDays && durationDays > 15)),
        };
        const parsed = leaveAbsenceFormSchema.safeParse(payload);
        if (!parsed.success) {
            setFieldErrors(mapZodFieldErrors<LeaveFormField>(parsed.error));
            setError("Verifique os campos destacados.");
            return;
        }
        setFieldErrors({});
        saveMutation.mutate(parsed.data);
    };

    const durationDays = inclusiveDays(form.startDate, form.endDate);
    const relatedDays = form.relatedCertificateDays ?? durationDays ?? 0;
    const needsInssAttention = Boolean(form.requiresInss || (durationDays && durationDays > 15) || relatedDays > 15);
    const isWorkAccident = form.leaveType === "OCCUPATIONAL_ACCIDENT";
    const filledStepIds = useMemo(() => {
        const filled: string[] = [];
        if (
            sectionHasChanges(form, emptyDefaults, [
                "collaboratorId",
                "leaveType",
                "absenceStatus",
                "startDate",
                "endDate",
                "notes",
            ])
        ) {
            filled.push("cadastro");
        }
        if (sectionHasChanges(form, emptyDefaults, ["cid", "physicianName", "physicianCrm", "certificateSource"])) {
            filled.push("atestado");
        }
        if (
            sectionHasChanges(form, emptyDefaults, [
                "requiresInss",
                "inssReferralDate",
                "returnDate",
                "workAccidentStability",
            ])
        ) {
            filled.push("impactos");
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
            <FormSection id="cadastro" title="Afastamento">
                <div className="sm:col-span-6">
                    <CollaboratorPickerField
                        value={form.collaboratorId ?? ""}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                        error={fieldErrors.collaboratorId}
                    />
                </div>
                <InputSelect
                    label="Tipo"
                    items={ABSENCE_TYPE_ITEMS}
                    value={form.leaveType ?? ""}
                    onValueChange={(v) => update("leaveType", (v || undefined) as LeaveRequestCreateDto["leaveType"])}
                    wrapperClassName="sm:col-span-3"
                    placeholder="Selecione"
                    required
                    error={fieldErrors.leaveType}
                />
                <InputSelect
                    label="Status"
                    items={LEAVE_ABSENCE_STATUS_ITEMS}
                    value={form.absenceStatus ?? "VALIDATED"}
                    onValueChange={(v) =>
                        update("absenceStatus", (v || "VALIDATED") as LeaveRequestCreateDto["absenceStatus"])
                    }
                    wrapperClassName="sm:col-span-3"
                    required
                    error={fieldErrors.absenceStatus}
                />
                <InputDate
                    label="Data de inicio"
                    value={form.startDate ?? ""}
                    onValueChange={(v) => update("startDate", v)}
                    wrapperClassName="sm:col-span-3"
                    required
                    error={fieldErrors.startDate}
                />
                <InputDate
                    label="Data de fim"
                    value={form.endDate ?? ""}
                    onValueChange={(v) => update("endDate", v)}
                    wrapperClassName="sm:col-span-3"
                    required
                    error={fieldErrors.endDate}
                />
                <InputNumber
                    label="Quantidade de dias"
                    value={durationDays ?? form.durationDays ?? null}
                    onValueChange={(v) => update("durationDays", v ?? undefined)}
                    wrapperClassName="sm:col-span-2"
                    integer
                    readOnly
                />
                <InputDate
                    label="Data de retorno"
                    value={form.returnDate ?? ""}
                    onValueChange={(v) => update("returnDate", v)}
                    wrapperClassName="sm:col-span-4"
                    error={fieldErrors.returnDate}
                />
                <InputString
                    label="Observacoes"
                    value={form.notes ?? ""}
                    onValueChange={(v) => update("notes", v)}
                    wrapperClassName="sm:col-span-12"
                    error={fieldErrors.notes}
                />
            </FormSection>

            <FormSection id="atestado" title="Atestado e origem">
                <InputString
                    label="CID"
                    value={form.cid ?? ""}
                    onValueChange={(v) => update("cid", v)}
                    wrapperClassName="sm:col-span-2"
                    error={fieldErrors.cid}
                />
                <InputString
                    label="Medico"
                    value={form.physicianName ?? ""}
                    onValueChange={(v) => update("physicianName", v)}
                    wrapperClassName="sm:col-span-4"
                    error={fieldErrors.physicianName}
                />
                <InputString
                    label="CRM"
                    value={form.physicianCrm ?? ""}
                    onValueChange={(v) => update("physicianCrm", v)}
                    wrapperClassName="sm:col-span-2"
                    error={fieldErrors.physicianCrm}
                />
                <InputString
                    label="Origem do atestado"
                    value={form.certificateSource ?? ""}
                    onValueChange={(v) => update("certificateSource", v)}
                    wrapperClassName="sm:col-span-4"
                    error={fieldErrors.certificateSource}
                />
                <InputNumber
                    label="Dias relacionados"
                    value={form.relatedCertificateDays ?? durationDays ?? null}
                    onValueChange={(v) => update("relatedCertificateDays", v ?? undefined)}
                    wrapperClassName="sm:col-span-2"
                    integer
                    readOnly
                />
                <InputInfo
                    label="Orientação"
                    value={
                        form.cid
                            ? "Periodos validados do mesmo colaborador com o mesmo CID sao somados para sinalizar possivel encaminhamento ao INSS."
                            : "CID e CRM seguem opcionais, mas ajudam a identificar atestados relacionados e auditoria do afastamento."
                    }
                    wrapperClassName="sm:col-span-10"
                />
            </FormSection>

            <FormSection id="impactos" title="Impactos legais e operacionais">
                <InputSelect
                    label="Necessita INSS"
                    items={YES_NO_ITEMS}
                    value={String(Boolean(form.requiresInss || needsInssAttention))}
                    onValueChange={(v) => update("requiresInss", v === "true")}
                    wrapperClassName="sm:col-span-3"
                    error={fieldErrors.requiresInss}
                />
                <InputDate
                    label="Encaminhamento INSS"
                    value={form.inssReferralDate ?? ""}
                    onValueChange={(v) => update("inssReferralDate", v)}
                    wrapperClassName="sm:col-span-3"
                    error={fieldErrors.inssReferralDate}
                />
                <InputSelect
                    label="Estabilidade futura"
                    items={YES_NO_ITEMS}
                    value={String(Boolean(form.workAccidentStability || isWorkAccident))}
                    onValueChange={(v) => update("workAccidentStability", v === "true")}
                    wrapperClassName="sm:col-span-3"
                    error={fieldErrors.workAccidentStability}
                />
                <InputInfo
                    value={
                        needsInssAttention ? 'Afastamento acima de 15 dias ou periodos relacionados acima do limite: registrar encaminhamento ao INSS.'
                            : isWorkAccident ? 'Acidente de trabalho deve permanecer sinalizado para avaliacao de estabilidade apos retorno.'
                            : 'Para prestadores PJ, o registro documenta a indisponibilidade operacional; efeitos financeiros dependem do contrato de prestacao de servicos.'
                    }
                    wrapperClassName={'sm:col-span-12'}
                />
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
