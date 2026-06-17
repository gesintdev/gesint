"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DepartmentPickerField } from "@/modules/dp/organization/department/components/DepartmentPickerField";
import { JobPositionPickerField } from "@/modules/dp/organization/jobposition/components/JobPositionPickerField";
import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { AdmissionEmergencyContactsField } from "@/modules/rh/person/collaborators/admission/components/AdmissionEmergencyContactsField";
import { AdmissionSummary } from "@/modules/rh/person/collaborators/admission/components/AdmissionSummary";
import type { AdmissionProcessCreateDto } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import { isAdmissionPj } from "@/modules/rh/person/collaborators/admission/lib/admission-contract.util";
import {
    ADMISSION_DOCUMENT_TYPE_ITEMS,
    CONTRACT_TYPE_ITEMS,
    contractDocumentTypeItems,
    WORKLOAD_SCHEDULE_ITEMS,
} from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import {
    ADMISSION_STEP_IDS,
    admissionFormToPayload,
    admissionprocessToFormDto,
    emptyAdmissionProcessForm,
} from "@/modules/rh/person/collaborators/admission/lib/admission-process.mapper";
import {
    computeFilledAdmissionSteps,
} from "@/modules/rh/person/collaborators/admission/lib/admission-status.util";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { storageService } from "@/modules/storage/services/storage.service";
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
import {
    InputCEP,
    InputCNPJ,
    InputCPF,
    InputCurrency,
    InputDate,
    InputSelect,
    InputString,
    RgIdentityFields,
} from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ProfilePhotoField } from "@/shared/components/ui/ProfilePhotoField";
import { ExceptionCapture } from "@/shared/exceptions";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";

const GENDER_ITEMS: SelectItem[] = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Feminino" },
    { value: "OTHER", label: "Outro" },
    { value: "NOT_INFORMED", label: "Prefere não informar" },
];
const MARITAL_ITEMS: SelectItem[] = [
    { value: "SINGLE", label: "Solteiro(a)" },
    { value: "MARRIED", label: "Casado(a)" },
    { value: "DIVORCED", label: "Divorciado(a)" },
    { value: "WIDOWED", label: "Viúvo(a)" },
    { value: "OTHER", label: "Outro" },
];
const ADMISSION_FORM_STEPS: FormStepNavItem[] = [
    { id: "dados-basicos", label: "Dados básicos" },
    { id: "contatos-emergencia", label: "Contatos de emergência" },
    { id: "endereco", label: "Endereço" },
    { id: "documentos", label: "Documentos" },
    { id: "vinculo", label: "Vínculo" },
    { id: "contrato", label: "Contrato" },
    { id: "observacoes", label: "Observações" },
];

export function AdmissionProcessFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AdmissionProcessCreateDto>(emptyAdmissionProcessForm);
    const [error, setError] = useState<string | null>(null);
    const [pendingPhotoBlob, setPendingPhotoBlob] = useState<Blob | null>(null);
    const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
    const [pendingDocumentAttachments, setPendingDocumentAttachments] = useState<PendingAttachment[]>([]);
    const [pendingContractAttachments, setPendingContractAttachments] = useState<PendingAttachment[]>([]);
    const detailQuery = useQuery({
        queryKey: admissionprocessKeys.detail(editingId ?? ""),
        queryFn: () => admissionprocessService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    const attachmentsQuery = useQuery({
        queryKey: ["storage-links", "admission_process", editingId],
        queryFn: () => storageService.listLinks("admission_process", editingId!),
        enabled: Boolean(editingId),
    });
    const clearPendingAttachments = useCallback(() => {
        setPendingDocumentAttachments([]);
        setPendingContractAttachments([]);
    }, []);
    const stepContext = useMemo(
        () => ({
            documentCount:
                (attachmentsQuery.data ?? []).filter((link) => link.linkRole === "DOCUMENT").length +
                pendingDocumentAttachments.length,
            contractDocumentCount:
                (attachmentsQuery.data ?? []).filter((link) => link.linkRole === "CONTRACT").length +
                pendingContractAttachments.length,
        }),
        [
            attachmentsQuery.data,
            pendingContractAttachments.length,
            pendingDocumentAttachments.length,
        ],
    );
    const clearPendingPhoto = useCallback(() => {
        setPendingPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return null;
        });
        setPendingPhotoBlob(null);
    }, []);
    const update = <K extends keyof AdmissionProcessCreateDto>(field: K, value: AdmissionProcessCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyAdmissionProcessForm());
            setError(null);
            clearPendingPhoto();
            clearPendingAttachments();
            return;
        }

        if (detailQuery.data) {
            setForm(admissionprocessToFormDto(detailQuery.data));
            setError(null);
            clearPendingPhoto();
            clearPendingAttachments();
        }
    }, [isEditing, detailQuery.data, clearPendingAttachments, clearPendingPhoto, editingId]);

    const handlePhotoCropComplete = useCallback((blob: Blob) => {
        setPendingPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return URL.createObjectURL(blob);
        });
        setPendingPhotoBlob(blob);
    }, []);
    const handlePhotoClear = useCallback(() => {
        clearPendingPhoto();
        update("photoObjectId", "");
    }, [clearPendingPhoto]);
    const saveMutation = useMutation({
        mutationFn: async (dto: AdmissionProcessCreateDto) => {
            let payload = admissionFormToPayload(dto);
            if (pendingPhotoBlob) {
                const file = new File([pendingPhotoBlob], "profile-photo.jpg", { type: "image/jpeg" });
                const object = await storageService.upload(file);
                payload = { ...payload, photoObjectId: object.id };
            }
            let savedId = editingId ?? null;
            if (isEditing && editingId) {
                await admissionprocessService.update(editingId, payload);
                savedId = editingId;
            } else {
                const created = await admissionprocessService.create(payload);
                savedId = created.id;
            }

            if (!savedId) {
                throw new Error("Não foi possível identificar o registro salvo.");
            }
            await flushPendingAttachments({
                entityType: "admission_process",
                entityId: savedId,
                linkRole: "DOCUMENT",
                items: pendingDocumentAttachments,
            });
            await flushPendingAttachments({
                entityType: "admission_process",
                entityId: savedId,
                linkRole: "CONTRACT",
                items: pendingContractAttachments,
            });
            await admissionprocessService.update(savedId, payload);
            return savedId;
        },
        onSuccess: async (savedId) => {
            clearPendingPhoto();
            clearPendingAttachments();
            await queryClient.invalidateQueries({ queryKey: admissionprocessKeys.all });
            await queryClient.invalidateQueries({ queryKey: admissionprocessKeys.detail(savedId) });
            await queryClient.invalidateQueries({ queryKey: ["storage-links", "admission_process", savedId] });
            toast.success(isEditing ? "Admissão atualizada" : "Admissão registrada");
            setForm(emptyAdmissionProcessForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: ADMISSION_CLIENT_MESSAGES.ADMISSION_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };
    const filledStepIds =
        isEditing && detailQuery.data?.completedStepIds
            ? detailQuery.data.completedStepIds
            : computeFilledAdmissionSteps(form, stepContext, ADMISSION_STEP_IDS);
    const isPj = isAdmissionPj(form.contractType);
    const contractDocTypeItems = useMemo(() => contractDocumentTypeItems(form.contractType), [form.contractType]);
    const summaryAdmissionStatus = detailQuery.data?.admissionStatus ?? "IN_PROGRESS";
    const summaryCompletedStepCount =
        detailQuery.data?.completedStepCount ?? filledStepIds.length;
    const summaryRequiredStepCount = detailQuery.data?.requiredStepCount ?? 6;

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 6 }).map((_, i) => (
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
                        ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED,
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
                steps: ADMISSION_FORM_STEPS,
                filledStepIds,
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
                            Nova admissão
                        </Button>
                    )}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar admissão"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="dados-basicos"
                title="Dados básicos"
                description="Identificação pessoal e contato do colaborador."
                bodyClassName="!block"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                    <div className="flex flex-col gap-4 lg:h-full lg:max-w-[15rem] lg:shrink-0">
                        <ProfilePhotoField
                            photoObjectId={form.photoObjectId || undefined}
                            pendingPreviewUrl={pendingPreviewUrl}
                            onCropComplete={handlePhotoCropComplete}
                            onClear={handlePhotoClear}
                            displayName={form.fullName || "Colaborador"}
                        />
                        <div className="min-h-0 flex-1">
                            <AdmissionSummary
                                form={form}
                                entityCode={isEditing ? detailQuery.data?.code : undefined}
                                admissionStatus={summaryAdmissionStatus}
                                completedStepCount={summaryCompletedStepCount}
                                requiredStepCount={summaryRequiredStepCount}
                            />
                        </div>
                    </div>
                    <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
                        <InputString
                            label="Nome completo"
                            value={form.fullName}
                            onValueChange={(v) => update("fullName", v)}
                            required
                            wrapperClassName="sm:col-span-2"
                        />
                        <InputString
                            label="Nome social"
                            value={form.socialName ?? ""}
                            onValueChange={(v) => update("socialName", v)}
                        />
                        <InputCPF label="CPF" value={form.cpf} onValueChange={(v) => update("cpf", v)} required />
                        <RgIdentityFields
                            rg={form.rg ?? ""}
                            rgIssuer={form.rgIssuer}
                            rgStateCode={form.rgStateCode}
                            onRgChange={(v) => update("rg", v)}
                            onRgIssuerChange={(v) => update("rgIssuer", v)}
                            onRgStateCodeChange={(v) => update("rgStateCode", v)}
                        />
                        <InputDate
                            label="Data de nascimento"
                            value={form.birthDate}
                            onValueChange={(v) => update("birthDate", v)}
                            required
                        />
                        <InputSelect
                            label="Gênero"
                            items={GENDER_ITEMS}
                            value={form.gender ?? ""}
                            onValueChange={(v) =>
                                update("gender", (v || undefined) as AdmissionProcessCreateDto["gender"])
                            }
                            placeholder="Não informado"
                            clearable
                        />
                        <InputSelect
                            label="Estado civil"
                            items={MARITAL_ITEMS}
                            value={form.maritalStatus ?? ""}
                            onValueChange={(v) =>
                                update("maritalStatus", (v || undefined) as AdmissionProcessCreateDto["maritalStatus"])
                            }
                            placeholder="Não informado"
                            clearable
                        />
                        <InputString
                            label="Nacionalidade"
                            value={form.nationality ?? ""}
                            onValueChange={(v) => update("nationality", v)}
                        />
                        {!isPj ? (
                            <InputString
                                label="PIS/PASEP"
                                value={form.pisPasep ?? ""}
                                onValueChange={(v) => update("pisPasep", v)}
                            />
                        ) : null}
                        <InputString
                            label="Nome da mãe"
                            value={form.motherName ?? ""}
                            onValueChange={(v) => update("motherName", v)}
                            wrapperClassName="sm:col-span-2"
                        />
                        <InputString
                            label="Nome do pai"
                            value={form.fatherName ?? ""}
                            onValueChange={(v) => update("fatherName", v)}
                            wrapperClassName="sm:col-span-2"
                        />
                        <InputString
                            label="E-mail"
                            value={form.email ?? ""}
                            onValueChange={(v) => update("email", v)}
                        />
                        <InputString
                            label="Telefone / WhatsApp"
                            value={form.phone ?? ""}
                            onValueChange={(v) => update("phone", v)}
                        />
                    </div>
                </div>
            </FormSection>
            <FormSection
                id="contatos-emergencia"
                title="Contatos de emergência"
                description="Pessoas de referência em caso de urgência."
            >
                <AdmissionEmergencyContactsField
                    contacts={form.emergencyContacts ?? []}
                    onChange={(emergencyContacts) => update("emergencyContacts", emergencyContacts)}
                />
            </FormSection>
            <FormSection id="endereco" title="Endereço" description="Residência principal informada na admissão.">
                <InputCEP label="CEP" value={form.zipCode ?? ""} onValueChange={(v) => update("zipCode", v)} />
                <InputString
                    label="UF"
                    value={form.stateCode ?? ""}
                    onValueChange={(v) => update("stateCode", v)}
                    maxLength={2}
                />
                <InputString
                    label="Logradouro"
                    value={form.street ?? ""}
                    onValueChange={(v) => update("street", v)}
                    wrapperClassName="sm:col-span-2"
                />
                <InputString label="Número" value={form.number ?? ""} onValueChange={(v) => update("number", v)} />
                <InputString
                    label="Complemento"
                    value={form.complement ?? ""}
                    onValueChange={(v) => update("complement", v)}
                />
                <InputString label="Bairro" value={form.district ?? ""} onValueChange={(v) => update("district", v)} />
                <InputString label="Cidade" value={form.city ?? ""} onValueChange={(v) => update("city", v)} />
            </FormSection>
            <FormSection
                id="documentos"
                title="Documentos"
                description="Anexos pessoais vinculados ao processo de admissão."
                bodyClassName="!block"
            >
                <EntityAttachments
                    entityType="admission_process"
                    entityId={editingId}
                    linkRole="DOCUMENT"
                    documentTypeItems={ADMISSION_DOCUMENT_TYPE_ITEMS}
                    deferUpload
                    pendingAttachments={pendingDocumentAttachments}
                    onPendingAttachmentsChange={setPendingDocumentAttachments}
                />
            </FormSection>
            <FormSection id="vinculo" title="Vínculo previsto" description="Contrato e alocação organizacional.">
                <InputDate
                    label="Previsão de início"
                    value={form.expectedStartDate}
                    onValueChange={(v) => update("expectedStartDate", v)}
                    required
                />
                <InputSelect
                    label="Tipo de contrato"
                    items={CONTRACT_TYPE_ITEMS}
                    value={form.contractType ?? "CLT"}
                    onValueChange={(v) => {
                        const next = (v || "CLT") as AdmissionProcessCreateDto["contractType"];
                        setForm((prev) =>
                            next === "PJ"
                                ? {
                                      ...prev,
                                      contractType: next,
                                      workloadSchedule: "",
                                      pisPasep: "",
                                  }
                                : {
                                      ...prev,
                                      contractType: next,
                                      providerCnpj: "",
                                      providerLegalName: "",
                                      providerTradeName: "",
                                  },
                        );
                    }}
                    required
                />
                {isPj ? (
                    <>
                        <InputCNPJ
                            label="CNPJ da prestadora"
                            value={form.providerCnpj ?? ""}
                            onValueChange={(v) => update("providerCnpj", v)}
                            required
                        />
                        <InputString
                            label="Razão social"
                            value={form.providerLegalName ?? ""}
                            onValueChange={(v) => update("providerLegalName", v)}
                            required
                        />
                        <InputString
                            label="Nome fantasia"
                            value={form.providerTradeName ?? ""}
                            onValueChange={(v) => update("providerTradeName", v)}
                            wrapperClassName="sm:col-span-2"
                        />
                    </>
                ) : null}
                <InputCurrency
                    label={isPj ? "Valor do contrato" : "Salário base"}
                    value={form.baseSalary != null ? String(form.baseSalary) : ""}
                    onValueChange={(v) => update("baseSalary", v)}
                    emitAsDecimal
                />
                {!isPj ? (
                    <InputSelect
                        label="Carga horária"
                        items={WORKLOAD_SCHEDULE_ITEMS}
                        value={form.workloadSchedule ?? ""}
                        onValueChange={(v) => update("workloadSchedule", v)}
                        placeholder="Selecione"
                        required
                    />
                ) : null}
                <InputString
                    label="ID empresa (opcional)"
                    value={form.companyId ?? ""}
                    onValueChange={(v) => update("companyId", v)}
                />
                <DepartmentPickerField
                    value={form.departmentId ?? ""}
                    onValueChange={(v) => {
                        update("departmentId", v);
                        update("jobPositionId", "");
                    }}
                />
                <JobPositionPickerField
                    value={form.jobPositionId ?? ""}
                    departmentId={form.departmentId}
                    onValueChange={(v) => update("jobPositionId", v)}
                    wrapperClassName="sm:col-span-2"
                />
            </FormSection>
            <FormSection
                id="contrato"
                title="Contrato"
                description="Datas do contrato e documentos assinados."
                bodyClassName="!block"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <InputDate
                        label="Início do contrato"
                        value={form.contractStartDate ?? ""}
                        onValueChange={(v) => update("contractStartDate", v)}
                        required
                    />
                    <InputDate
                        label="Fim do contrato"
                        value={form.contractEndDate ?? ""}
                        onValueChange={(v) => update("contractEndDate", v)}
                    />
                </div>
                <EntityAttachments
                    entityType="admission_process"
                    entityId={editingId}
                    linkRole="CONTRACT"
                    documentTypeItems={contractDocTypeItems}
                    emptyMessage="Nenhum documento de contrato anexado."
                    deferUpload
                    pendingAttachments={pendingContractAttachments}
                    onPendingAttachmentsChange={setPendingContractAttachments}
                />
            </FormSection>
            <FormSection
                id="observacoes"
                title="Observações"
                description="Notas internas sobre o processo de admissão."
            >
                <InputString
                    label="Observações internas"
                    value={form.notes ?? ""}
                    onValueChange={(v) => update("notes", v)}
                    wrapperClassName="sm:col-span-2"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
