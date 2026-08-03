"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { JobPositionPickerField } from "@/modules/dp/organization/jobposition/components/JobPositionPickerField";
import { medicalClinicKeys } from "@/modules/rh/person/occupational-exam/clinic/medical-clinic.query";
import { medicalClinicService } from "@/modules/rh/person/occupational-exam/clinic/services/medical-clinic.service";
import type { OccupationalExamCreateDto } from "@/modules/rh/person/occupational-exam/dto/occupational-exam.dto";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/rh/person/occupational-exam/exceptions/occupational-exam.messages";
import {
    emptyOccupationalExamForm,
    occupationalExamToFormDto,
} from "@/modules/rh/person/occupational-exam/lib/occupational-exam.mapper";
import {
    OCCUPATIONAL_EXAM_ATTACHMENT_TYPES,
    OCCUPATIONAL_EXAM_ENTITY_TYPE,
    OCCUPATIONAL_EXAM_LIFECYCLE_ITEMS,
    OCCUPATIONAL_EXAM_RESULT_ITEMS,
    OCCUPATIONAL_EXAM_TYPE_ITEMS,
} from "@/modules/rh/person/occupational-exam/lib/occupational-exam.options";
import { occupationalExamKeys } from "@/modules/rh/person/occupational-exam/occupational-exam.query";
import { occupationalPhysicianKeys } from "@/modules/rh/person/occupational-exam/physician/occupational-physician.query";
import { occupationalPhysicianService } from "@/modules/rh/person/occupational-exam/physician/services/occupational-physician.service";
import { occupationalExamService } from "@/modules/rh/person/occupational-exam/services/occupational-exam.service";
import { useHasPermission } from "@/shared/auth/permissions";
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
import { InputDate, InputInfo, InputSelect, InputString } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "cadastro", label: "Exame" },
    { id: "resultado", label: "Resultado" },
    { id: "documentos", label: "Documentos" },
];

export function OccupationalExamFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const canViewClinical = useHasPermission("occupationalexam:clinical");
    const [form, setForm] = useState<OccupationalExamCreateDto>(emptyOccupationalExamForm);
    const [dueDate, setDueDate] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

    const detailQuery = useQuery({
        queryKey: occupationalExamKeys.detail(editingId ?? ""),
        queryFn: () => occupationalExamService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    const clinicsQuery = useQuery({
        queryKey: medicalClinicKeys.all,
        queryFn: () => medicalClinicService.getAll(),
    });

    const physiciansQuery = useQuery({
        queryKey: occupationalPhysicianKeys.all,
        queryFn: () => occupationalPhysicianService.getAll(),
    });

    const clearPendingAttachments = useCallback(() => {
        setPendingAttachments([]);
    }, []);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyOccupationalExamForm());
            setDueDate(undefined);
            setError(null);
            clearPendingAttachments();
            return;
        }
        if (detailQuery.data) {
            setForm(occupationalExamToFormDto(detailQuery.data));
            setDueDate(detailQuery.data.dueDate);
            setError(null);
            clearPendingAttachments();
        }
    }, [isEditing, detailQuery.data, clearPendingAttachments]);

    const clinicItems: SelectItem[] = (clinicsQuery.data ?? []).map((clinic) => ({
        value: clinic.id,
        label: clinic.corporateName,
    }));

    const physicianItems: SelectItem[] = (physiciansQuery.data ?? []).map((physician) => ({
        value: physician.id,
        label: `${physician.fullName} (CRM ${physician.crm}/${physician.crmState})`,
    }));

    const saveMutation = useMutation({
        mutationFn: async (dto: OccupationalExamCreateDto) => {
            const payload: OccupationalExamCreateDto = { ...dto };
            if (!canViewClinical) {
                delete payload.cid;
                delete payload.clinicalObservations;
            }
            let savedId = editingId ?? null;
            if (isEditing && editingId) {
                const updated = await occupationalExamService.update(editingId, payload);
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
                linkRole: "ASO",
                items: pendingAttachments,
            });
            return savedId;
        },
        onSuccess: async (savedId) => {
            clearPendingAttachments();
            await queryClient.invalidateQueries({ queryKey: occupationalExamKeys.all });
            await queryClient.invalidateQueries({ queryKey: occupationalExamKeys.detail(savedId) });
            await queryClient.invalidateQueries({
                queryKey: ["storage-links", OCCUPATIONAL_EXAM_ENTITY_TYPE, savedId],
            });
            toast.success(isEditing ? "Exame atualizado" : "Exame cadastrado");
            setForm(emptyOccupationalExamForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof OccupationalExamCreateDto>(field: K, value: OccupationalExamCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.collaboratorId || !form.jobPositionId || !form.examType) {
            setError("Preencha colaborador, cargo e tipo de exame.");
            return;
        }
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        OCCUPATIONAL_EXAM_CLIENT_MESSAGES.LOAD_FAILED,
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    {isEditing && (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    )}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="cadastro" title="Exame ocupacional" description="Obrigacao e convocacao.">
                <div className="sm:col-span-12">
                    <CollaboratorPickerField
                        value={form.collaboratorId}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                    />
                </div>
                <div className="sm:col-span-12">
                    <JobPositionPickerField
                        value={form.jobPositionId}
                        onValueChange={(v) => update("jobPositionId", v)}
                        required
                    />
                </div>
                <InputSelect
                    label="Tipo de exame"
                    items={OCCUPATIONAL_EXAM_TYPE_ITEMS}
                    value={form.examType}
                    onValueChange={(v) => update("examType", v as OccupationalExamCreateDto["examType"])}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Status do ciclo"
                    items={OCCUPATIONAL_EXAM_LIFECYCLE_ITEMS}
                    value={form.lifecycleStatus ?? "PREVISTO"}
                    onValueChange={(v) =>
                        update("lifecycleStatus", v as OccupationalExamCreateDto["lifecycleStatus"])
                    }
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Clinica"
                    items={clinicItems}
                    value={form.clinicId ?? ""}
                    onValueChange={(v) => update("clinicId", v || undefined)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Medico examinador"
                    items={physicianItems}
                    value={form.examinerPhysicianId ?? ""}
                    onValueChange={(v) => update("examinerPhysicianId", v || undefined)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputDate
                    label="Data agendada"
                    value={form.scheduledDate ?? ""}
                    onValueChange={(v) => update("scheduledDate", v || undefined)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Data do exame clinico"
                    value={form.clinicalExamDate ?? ""}
                    onValueChange={(v) => update("clinicalExamDate", v || undefined)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputInfo
                    label="Vencimento (calculado)"
                    value={dueDate ? dueDate : "Calculado pela matriz de exames"}
                    wrapperClassName="sm:col-span-4"
                />
            </FormSection>

            <FormSection id="resultado" title="Resultado e aptidao">
                <InputSelect
                    label="Resultado (ASO)"
                    items={OCCUPATIONAL_EXAM_RESULT_ITEMS}
                    value={form.result ?? ""}
                    onValueChange={(v) => update("result", (v || undefined) as OccupationalExamCreateDto["result"])}
                    wrapperClassName="sm:col-span-6"
                />
                <InputDate
                    label="Emissao do ASO"
                    value={form.asoIssueDate ?? ""}
                    onValueChange={(v) => update("asoIssueDate", v || undefined)}
                    wrapperClassName="sm:col-span-6"
                />
                {canViewClinical ? (
                    <>
                        <InputString
                            label="CID"
                            value={form.cid ?? ""}
                            onValueChange={(v) => update("cid", v || undefined)}
                            wrapperClassName="sm:col-span-4"
                        />
                        <InputString
                            label="Observacoes clinicas"
                            value={form.clinicalObservations ?? ""}
                            onValueChange={(v) => update("clinicalObservations", v || undefined)}
                            wrapperClassName="sm:col-span-8"
                        />
                    </>
                ) : (
                    <InputInfo
                        label="Dados clinicos"
                        value="Visiveis apenas para perfil com permissao occupationalexam:clinical"
                        wrapperClassName="sm:col-span-12"
                    />
                )}
            </FormSection>

            <FormSection
                id="documentos"
                title="Documentos"
                description="ASO e laudos de exames complementares (hash de integridade via storage)."
                bodyClassName="!block"
            >
                <EntityAttachments
                    entityType={OCCUPATIONAL_EXAM_ENTITY_TYPE}
                    entityId={editingId}
                    documentTypeItems={OCCUPATIONAL_EXAM_ATTACHMENT_TYPES}
                    deferUpload
                    pendingAttachments={pendingAttachments}
                    onPendingAttachmentsChange={setPendingAttachments}
                />
            </FormSection>

            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
