"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type SubmitEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {toast} from "sonner";

import {DepartmentPickerField} from "@/modules/dp/organization/department/components/DepartmentPickerField";
import {JobPositionPickerField} from "@/modules/dp/organization/jobposition/components/JobPositionPickerField";
import {workScheduleService} from "@/modules/cfg/settings/workschedule/services/work-schedule.service";
import {workScheduleKeys} from "@/modules/cfg/settings/workschedule/workschedule.query";
import {admissionprocessKeys} from "@/modules/rh/person/collaborators/admission/admission.query";
import {
    AdmissionEmergencyContactsField
} from "@/modules/rh/person/collaborators/admission/components/AdmissionEmergencyContactsField";
import {AdmissionSummary} from "@/modules/rh/person/collaborators/admission/components/AdmissionSummary";
import type {AdmissionProcessCreateDto} from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import {
    ADMISSION_CLIENT_MESSAGES
} from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import {isAdmissionPj} from "@/modules/rh/person/collaborators/admission/lib/admission-contract.util";
import {
    ADMISSION_DOCUMENT_TYPE_ITEMS,
    ADMISSION_FORM_STEPS,
    CONTRACT_TYPE_ITEMS,
    contractDocumentTypeItems,
    GENDER_ITEMS,
    MARITAL_ITEMS,
    RECESS_FINANCIAL_ITEMS,
    WORKLOAD_SCHEDULE_ITEMS,
    YES_NO_ITEMS,
} from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import {
    admissionFormToPayload,
    admissionprocessToFormDto,
    emptyAdmissionProcessForm,
} from "@/modules/rh/person/collaborators/admission/lib/admission-process.mapper";
import {computeFilledAdmissionSteps} from "@/modules/rh/person/collaborators/admission/lib/admission-status.util";
import {addressService} from "@/modules/rh/person/collaborators/admission/services/address.service";
import {admissionprocessService} from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import {storageService} from "@/modules/storage/services/storage.service";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {
    EntityAttachments,
    flushPendingAttachments,
    type PendingAttachment,
} from "@/shared/components/storage/EntityAttachments";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {
    InputCEP,
    InputCNPJ,
    InputCPF,
    InputCurrency,
    InputDate,
    InputSelect,
    InputSelectAutocomplete,
    InputString,
} from "@/shared/components/ui/input/index";
import {ProfilePhotoField} from "@/shared/components/ui/ProfilePhotoField";
import {ExceptionCapture} from "@/shared/exceptions";
import {digitsOnly} from "@/shared/lib/input/digits";
import {useSyncWorkspaceTabTitle} from "@/shared/workspace/useSyncWorkspaceTabTitle";

export function AdmissionProcessFormClient() {
    const {editingId, isEditing, goToList, startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AdmissionProcessCreateDto>(emptyAdmissionProcessForm);
    const [error, setError] = useState<string | null>(null);
    const [stateLabel, setStateLabel] = useState("");
    const [cityLabel, setCityLabel] = useState("");
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
    const workSchedulesQuery = useQuery({
        queryKey: workScheduleKeys.active,
        queryFn: () => workScheduleService.listActive(),
    });
    const workScheduleItems = useMemo(
        () =>
            (workSchedulesQuery.data ?? []).map((item) => ({
                value: item.id,
                label: item.weeklyTotalHours
                    ? `${item.name} (${item.weeklyTotalHours})`
                    : item.name,
            })),
        [workSchedulesQuery.data],
    );
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
        [attachmentsQuery.data, pendingContractAttachments.length, pendingDocumentAttachments.length],
    );
    const clearPendingPhoto = useCallback(() => {
        setPendingPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return null;
        });
        setPendingPhotoBlob(null);
    }, []);
    const lookedUpZipRef = useRef("");
    const update = <K extends keyof AdmissionProcessCreateDto>(field: K, value: AdmissionProcessCreateDto[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };
    const updateExpectedStartDate = (value: string) => {
        setForm((prev) => ({
            ...prev,
            expectedStartDate: value,
            contractStartDate: prev.contractStartDate || value,
        }));
    };
    const cepLookupMutation = useMutation({
        mutationFn: (postalCode: string) => addressService.findByPostalCode(postalCode),
        onSuccess: (address) => {
            lookedUpZipRef.current = address.zipCode;
            setForm((prev) => ({
                ...prev,
                zipCode: address.zipCode,
                street: address.street ?? prev.street,
                complement: address.complement || prev.complement,
                district: address.district ?? prev.district,
                stateId: address.stateId,
                cityId: address.cityId,
            }));
            setStateLabel(address.stateCode);
            setCityLabel(address.cityName);
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {
                fallbackMessage: ADMISSION_CLIENT_MESSAGES.ADDRESS_LOOKUP_FAILED,
            });
        },
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyAdmissionProcessForm());
            setError(null);
            setStateLabel("");
            setCityLabel("");
            clearPendingPhoto();
            clearPendingAttachments();
            return;
        }

        if (detailQuery.data) {
            setForm(admissionprocessToFormDto(detailQuery.data));
            setError(null);
            setStateLabel(detailQuery.data.stateCode ?? "");
            setCityLabel(detailQuery.data.cityName ?? "");
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
                const file = new File([pendingPhotoBlob], "profile-photo.jpg", {type: "image/jpeg"});
                const object = await storageService.upload(file);
                payload = {...payload, photoObjectId: object.id};
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
            await queryClient.invalidateQueries({queryKey: admissionprocessKeys.all});
            await queryClient.invalidateQueries({queryKey: admissionprocessKeys.detail(savedId)});
            await queryClient.invalidateQueries({queryKey: ["storage-links", "admission_process", savedId]});
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
    const isPj = isAdmissionPj(form.contractType);
    const admissionFormSteps = useMemo(
        () =>
            isPj
                ? [
                    ...ADMISSION_FORM_STEPS.slice(0, -1),
                    {id: "recesso-contratual", label: "Recesso contratual"},
                    ADMISSION_FORM_STEPS.at(-1)!,
                ]
                : ADMISSION_FORM_STEPS,
        [isPj],
    );
    const activeStepIds = useMemo(() => admissionFormSteps.map((step) => step.id), [admissionFormSteps]);
    const filledStepIds = computeFilledAdmissionSteps(form, stepContext, activeStepIds);
    const contractDocTypeItems = useMemo(() => contractDocumentTypeItems(form.contractType), [form.contractType]);
    const summaryAdmissionStatus = detailQuery.data?.admissionStatus ?? "IN_PROGRESS";
    const summaryCompletedStepCount = detailQuery.data?.completedStepCount ?? filledStepIds.length;
    const summaryRequiredStepCount = detailQuery.data?.requiredStepCount ?? 6;

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full"/>
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
                steps: admissionFormSteps,
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
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <div className="flex flex-col gap-4 lg:h-full lg:max-w-60 lg:shrink-0">
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
                    <div className="grid min-w-0 flex-1 content-start gap-x-4 gap-y-2.5 sm:grid-cols-12">
                        <InputString
                            label="Nome completo"
                            value={form.fullName}
                            onValueChange={(v) => update("fullName", v)}
                            required
                            wrapperClassName="sm:col-span-6"
                        />
                        <InputString
                            label="Nome social"
                            value={form.socialName ?? ""}
                            onValueChange={(v) => update("socialName", v)}
                            wrapperClassName="sm:col-span-6"
                        />
                        <InputString
                            label="Nome da mãe"
                            value={form.motherName ?? ""}
                            onValueChange={(v) => update("motherName", v)}
                            wrapperClassName="sm:col-span-6"
                        />
                        <InputString
                            label="Nome do pai"
                            value={form.fatherName ?? ""}
                            onValueChange={(v) => update("fatherName", v)}
                            wrapperClassName="sm:col-span-6"
                        />
                        <InputCPF
                            label="CPF"
                            value={form.cpf}
                            onValueChange={(v) => update("cpf", v)}
                            wrapperClassName="sm:col-span-2"
                            required
                        />
                        <InputString
                            label="RG"
                            value={form.rg ?? ""}
                            onValueChange={(v) => update("rg", digitsOnly(v).slice(0, 7))}
                            maxLength={7}
                            wrapperClassName="sm:col-span-2"
                        />
                        <InputString
                            label="Órgão emissor"
                            value={form.rgIssuer ?? ""}
                            onValueChange={(v) => update("rgIssuer", v)}
                            maxLength={4}
                            wrapperClassName="sm:col-span-2"
                        />
                        <InputString
                            label="UF emissão"
                            value={form.rgStateCode ?? ""}
                            onValueChange={(v) =>
                                update(
                                    "rgStateCode",
                                    v
                                        .toUpperCase()
                                        .replace(/[^A-Z]/g, "")
                                        .slice(0, 2),
                                )
                            }
                            maxLength={2}
                            wrapperClassName="sm:col-span-2"
                        />
                        <InputDate
                            label="Data de nascimento"
                            value={form.birthDate}
                            onValueChange={(v) => update("birthDate", v)}
                            wrapperClassName="sm:col-span-2"
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
                            wrapperClassName="sm:col-span-2"
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
                            wrapperClassName="sm:col-span-2"
                            clearable
                        />
                        <InputString
                            label="Nacionalidade"
                            value={form.nationality ?? ""}
                            onValueChange={(v) => update("nationality", v)}
                            wrapperClassName="sm:col-span-2"
                        />
                        {!isPj ? (
                            <InputString
                                label="PIS/PASEP"
                                value={form.pisPasep ?? ""}
                                onValueChange={(v) => update("pisPasep", v)}
                                wrapperClassName="sm:col-span-2"
                            />
                        ) : null}
                        <InputString
                            label="Telefone / WhatsApp"
                            value={form.phone ?? ""}
                            onValueChange={(v) => update("phone", v)}
                            wrapperClassName="sm:col-span-2"
                        />
                        <InputString
                            label="E-mail"
                            value={form.email ?? ""}
                            onValueChange={(v) => update("email", v)}
                            wrapperClassName="sm:col-span-4"
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
            <FormSection
                id="endereco"
                title="Endereço"
                description="Residência principal informada na admissão. O CEP preenche os dados automaticamente."
                bodyClassName="sm:!grid-cols-12"
            >
                <InputCEP
                    label="CEP"
                    value={form.zipCode ?? ""}
                    onValueChange={(v) => update("zipCode", v)}
                    loading={cepLookupMutation.isPending}
                    onKeyDown={(e) => {
                        if (e.key !== "Tab" || e.shiftKey) return;
                        if (cepLookupMutation.isPending) {
                            e.preventDefault();
                            return;
                        }
                        const zip = form.zipCode ?? "";
                        if (zip.length === 8 && zip !== lookedUpZipRef.current) {
                            e.preventDefault();
                            cepLookupMutation.mutate(zip);
                        }
                    }}
                    wrapperClassName="sm:col-span-3"
                />
                <InputSelectAutocomplete
                    label="UF"
                    value={form.stateId ?? ""}
                    selectedLabel={stateLabel}
                    onSearch={(query, page) => addressService.searchStates(query, page)}
                    onValueChange={(value, item) => {
                        const stateChanged = value !== (form.stateId ?? "");
                        setForm((prev) => ({
                            ...prev,
                            stateId: value,
                            cityId: stateChanged ? "" : prev.cityId,
                        }));
                        setStateLabel(item?.label ?? "");
                        if (stateChanged) setCityLabel("");
                    }}
                    remoteMinChars={0}
                    disabled={cepLookupMutation.isPending}
                    wrapperClassName="sm:col-span-3"
                />
                <InputSelectAutocomplete
                    label="Cidade"
                    value={form.cityId ?? ""}
                    selectedLabel={cityLabel}
                    onSearch={(query, page) => addressService.searchCities(form.stateId ?? "", query, page)}
                    onValueChange={(value, item) => {
                        update("cityId", value);
                        setCityLabel(item?.label ?? "");
                    }}
                    remoteMinChars={0}
                    disabled={!form.stateId || cepLookupMutation.isPending}
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Logradouro"
                    value={form.street ?? ""}
                    onValueChange={(v) => update("street", v)}
                    wrapperClassName="sm:col-span-8"
                />
                <InputString
                    label="Número"
                    value={form.number ?? ""}
                    onValueChange={(v) => update("number", v)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Bairro"
                    value={form.district ?? ""}
                    onValueChange={(v) => update("district", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Complemento"
                    value={form.complement ?? ""}
                    onValueChange={(v) => update("complement", v)}
                    wrapperClassName="sm:col-span-6"
                />
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
                    label="Data de início"
                    value={form.expectedStartDate}
                    onValueChange={updateExpectedStartDate}
                    wrapperClassName="sm:col-span-2"
                    required
                />
                <InputSelect
                    label="Tipo de contrato"
                    items={CONTRACT_TYPE_ITEMS}
                    value={form.contractType ?? "CLT"}
                    wrapperClassName="sm:col-span-2"
                    onValueChange={(v) => {
                        const next = (v || "CLT") as AdmissionProcessCreateDto["contractType"];
                        setForm((prev) =>
                            next === "PJ"
                                ? {
                                    ...prev,
                                    contractType: next,
                                    workloadSchedule: "",
                                    workScheduleId: "",
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
                            wrapperClassName="sm:col-span-2"
                        />
                        <InputString
                            label="Razão social"
                            value={form.providerLegalName ?? ""}
                            onValueChange={(v) => update("providerLegalName", v)}
                            required
                            wrapperClassName="sm:col-span-3"
                        />
                        <InputString
                            label="Nome fantasia"
                            value={form.providerTradeName ?? ""}
                            onValueChange={(v) => update("providerTradeName", v)}
                            wrapperClassName="sm:col-span-3"
                        />
                    </>
                ) : null}
                <InputCurrency
                    label={isPj ? "Valor do contrato" : "Salário base"}
                    value={form.baseSalary != null ? String(form.baseSalary) : ""}
                    onValueChange={(v) => update("baseSalary", v)}
                    emitAsDecimal
                    wrapperClassName="sm:col-span-2"
                />
                {!isPj ? (
                    <>
                        <InputSelect
                            label="Carga horária"
                            items={WORKLOAD_SCHEDULE_ITEMS}
                            value={form.workloadSchedule ?? ""}
                            onValueChange={(v) => update("workloadSchedule", v)}
                            placeholder="Selecione"
                            wrapperClassName="sm:col-span-2"
                            required
                        />
                        <InputSelect
                            label="Escala"
                            items={workScheduleItems}
                            value={form.workScheduleId ?? ""}
                            onValueChange={(v) => update("workScheduleId", v)}
                            placeholder={
                                workSchedulesQuery.isLoading
                                    ? "Carregando escalas…"
                                    : "Selecione a escala vigente"
                            }
                            wrapperClassName="sm:col-span-2"
                        />
                    </>
                ) : null}
                {/*<InputString*/}
                {/*    label="ID empresa (opcional)"*/}
                {/*    value={form.companyId ?? ""}*/}
                {/*    onValueChange={(v) => update("companyId", v)}*/}
                {/*    wrapperClassName="sm:col-span-4"*/}
                {/*/>*/}
                <DepartmentPickerField
                    value={form.departmentId ?? ""}
                    onValueChange={(v) => {
                        update("departmentId", v);
                        update("jobPositionId", "");
                    }}
                    wrapperClassName="sm:col-span-6"
                />
                <JobPositionPickerField
                    value={form.jobPositionId ?? ""}
                    departmentId={form.departmentId}
                    onValueChange={(v) => update("jobPositionId", v)}
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>
            <FormSection
                id="contrato"
                title="Contrato"
                description="Datas do contrato e documentos assinados."
                bodyClassName="!block"
            >
                <div className="grid gap-4 sm:grid-cols-2 mb-3">
                    <InputDate
                        label="Data de início do contrato"
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
            {isPj ? (
                <FormSection
                    id="recesso-contratual"
                    title="Recesso contratual"
                    description="Condição comercial prevista no contrato PJ; não corresponde a férias CLT."
                >
                    <InputSelect
                        label="O contrato prevê recesso?"
                        items={YES_NO_ITEMS}
                        value={String(form.recessEnabled ?? false)}
                        onValueChange={(v) => update("recessEnabled", v === "true")}
                        wrapperClassName="sm:col-span-2"
                    />
                    {form.recessEnabled ? (
                        <>
                            <InputString
                                label="Dias por ciclo"
                                value={String(form.recessTotalDaysPerCycle ?? "")}
                                onValueChange={(v) => update("recessTotalDaysPerCycle", v)}
                                required
                                wrapperClassName="sm:col-span-2"
                            />
                            <InputString
                                label="Duração do ciclo (meses)"
                                value={String(form.recessCycleMonths ?? "")}
                                onValueChange={(v) => update("recessCycleMonths", v)}
                                required
                                wrapperClassName="sm:col-span-2"
                            />
                            <InputString
                                label="Carência (meses)"
                                value={String(form.recessEligibilityAfterMonths ?? "")}
                                onValueChange={(v) => update("recessEligibilityAfterMonths", v)}
                                required
                                wrapperClassName="sm:col-span-2"
                            />
                            <InputSelect
                                label="Efeito no valor contratual"
                                items={RECESS_FINANCIAL_ITEMS}
                                value={form.recessFinancialMode ?? ""}
                                onValueChange={(v) =>
                                    update("recessFinancialMode", v as AdmissionProcessCreateDto["recessFinancialMode"])
                                }
                                required
                                wrapperClassName="sm:col-span-2"
                            />
                            {form.recessFinancialMode === "PROPORTIONAL" ? (
                                <InputString
                                    label="Percentual mantido"
                                    value={String(form.recessPaidPercentage ?? "")}
                                    onValueChange={(v) => update("recessPaidPercentage", v)}
                                    required
                                    wrapperClassName="sm:col-span-2"
                                />
                            ) : null}
                            <InputSelect
                                label="Permite fracionamento?"
                                items={YES_NO_ITEMS}
                                value={String(form.recessAllowSplit ?? false)}
                                onValueChange={(v) => update("recessAllowSplit", v === "true")}
                                wrapperClassName="sm:col-span-2"
                            />
                            {form.recessAllowSplit ? (
                                <>
                                    <InputString
                                        label="Máximo de parcelas"
                                        value={String(form.recessMaxSplitPeriods ?? "")}
                                        onValueChange={(v) => update("recessMaxSplitPeriods", v)}
                                        required
                                        wrapperClassName="sm:col-span-2"
                                    />
                                    <InputString
                                        label="Mínimo de dias por parcela"
                                        value={String(form.recessMinimumSplitDays ?? "")}
                                        onValueChange={(v) => update("recessMinimumSplitDays", v)}
                                        wrapperClassName="sm:col-span-2"
                                        required
                                    />
                                </>
                            ) : null}
                            <InputString
                                label="Antecedência mínima (dias)"
                                value={String(form.recessAdvanceNoticeDays ?? 0)}
                                onValueChange={(v) => update("recessAdvanceNoticeDays", v)}
                                wrapperClassName="sm:col-span-2"
                            />
                            <InputString
                                label="Cláusula ou observações"
                                value={form.recessNotes ?? ""}
                                onValueChange={(v) => update("recessNotes", v)}
                                wrapperClassName="sm:col-span-10"
                            />
                        </>
                    ) : null}
                </FormSection>
            ) : null}
            <FormSection
                id="observacoes"
                title="Observações"
                description="Notas internas sobre o processo de admissão."
            >
                <InputString
                    label="Observações internas"
                    value={form.notes ?? ""}
                    onValueChange={(v) => update("notes", v)}
                    wrapperClassName="sm:col-span-12"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
