"use client";

import type { ReactNode } from "react";

import type { OccupationalExamCreateDto } from "@/modules/dp/occupational-exam/dto/occupational-exam.dto";
import {
    OCCUPATIONAL_EXAM_ATTACHMENT_TYPES,
    OCCUPATIONAL_EXAM_ENTITY_TYPE,
    OCCUPATIONAL_EXAM_LINK_ROLE,
    OCCUPATIONAL_EXAM_LIFECYCLE_ITEMS,
    OCCUPATIONAL_EXAM_RESULT_ITEMS,
    OCCUPATIONAL_EXAM_TYPE_ITEMS,
} from "@/modules/dp/occupational-exam/lib/occupational-exam.options";
import {
    EntityAttachments,
    type PendingAttachment,
} from "@/shared/components/storage/EntityAttachments";
import { FormSection } from "@/shared/components/ui/FormSection";
import { InputDate, InputInfo, InputSelect, InputString } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

type OccupationalExamFormFieldsProps = {
    form: OccupationalExamCreateDto;
    onChange: <K extends keyof OccupationalExamCreateDto>(
        field: K,
        value: OccupationalExamCreateDto[K],
    ) => void;
    clinicItems: SelectItem[];
    physicianItems: SelectItem[];
    canViewClinical: boolean;
    examId?: string | null;
    pendingAttachments: PendingAttachment[];
    onPendingAttachmentsChange: (items: PendingAttachment[]) => void;
    /** Quando true, omite colaborador/cargo (contexto de admissão). */
    hideCollaboratorAndJob?: boolean;
    collaboratorField?: ReactNode;
    jobPositionField?: ReactNode;
};

export function OccupationalExamFormFields({
    form,
    onChange,
    clinicItems,
    physicianItems,
    canViewClinical,
    examId,
    pendingAttachments,
    onPendingAttachmentsChange,
    hideCollaboratorAndJob = false,
    collaboratorField,
    jobPositionField,
}: OccupationalExamFormFieldsProps) {
    return (
        <>
            <FormSection id="cadastro" title="Exame ocupacional" description="Obrigacao e convocacao.">
                {!hideCollaboratorAndJob ? (
                    <>
                        <div className="sm:col-span-6">{collaboratorField}</div>
                        <div className="sm:col-span-6">{jobPositionField}</div>
                    </>
                ) : null}
                <InputSelect
                    label="Tipo de exame"
                    items={OCCUPATIONAL_EXAM_TYPE_ITEMS}
                    value={form.examType}
                    onValueChange={(v) => onChange("examType", v as OccupationalExamCreateDto["examType"])}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Status do ciclo"
                    items={OCCUPATIONAL_EXAM_LIFECYCLE_ITEMS}
                    value={form.lifecycleStatus ?? "PREVISTO"}
                    onValueChange={(v) =>
                        onChange("lifecycleStatus", v as OccupationalExamCreateDto["lifecycleStatus"])
                    }
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Clinica"
                    items={clinicItems}
                    value={form.clinicId ?? ""}
                    onValueChange={(v) => onChange("clinicId", v || undefined)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Medico examinador"
                    items={physicianItems}
                    value={form.examinerPhysicianId ?? ""}
                    onValueChange={(v) => onChange("examinerPhysicianId", v || undefined)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputDate
                    label="Data agendada"
                    value={form.scheduledDate ?? ""}
                    onValueChange={(v) => onChange("scheduledDate", v || undefined)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Data do exame clinico"
                    value={form.clinicalExamDate ?? ""}
                    onValueChange={(v) => onChange("clinicalExamDate", v || undefined)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Vencimento"
                    value={form.dueDate ?? ""}
                    onValueChange={(v) => onChange("dueDate", v || undefined)}
                    wrapperClassName="sm:col-span-4"
                />
            </FormSection>

            <FormSection id="resultado" title="Resultado e aptidao">
                <InputSelect
                    label="Resultado (ASO)"
                    items={OCCUPATIONAL_EXAM_RESULT_ITEMS}
                    value={form.result ?? ""}
                    onValueChange={(v) =>
                        onChange("result", (v || undefined) as OccupationalExamCreateDto["result"])
                    }
                    wrapperClassName="sm:col-span-6"
                />
                <InputDate
                    label="Emissao do ASO"
                    value={form.asoIssueDate ?? ""}
                    onValueChange={(v) => onChange("asoIssueDate", v || undefined)}
                    wrapperClassName="sm:col-span-6"
                />
                {canViewClinical ? (
                    <>
                        <InputString
                            label="CID"
                            value={form.cid ?? ""}
                            onValueChange={(v) => onChange("cid", v || undefined)}
                            wrapperClassName="sm:col-span-4"
                        />
                        <InputString
                            label="Observacoes clinicas"
                            value={form.clinicalObservations ?? ""}
                            onValueChange={(v) => onChange("clinicalObservations", v || undefined)}
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
                    entityId={examId ?? undefined}
                    linkRole={OCCUPATIONAL_EXAM_LINK_ROLE}
                    documentTypeItems={OCCUPATIONAL_EXAM_ATTACHMENT_TYPES}
                    deferUpload
                    pendingAttachments={pendingAttachments}
                    onPendingAttachmentsChange={onPendingAttachmentsChange}
                />
            </FormSection>
        </>
    );
}
