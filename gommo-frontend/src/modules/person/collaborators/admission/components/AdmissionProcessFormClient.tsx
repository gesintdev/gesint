"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type FormEvent, useCallback, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";
import {
    ADMISSION_CLIENT_MESSAGES
} from "@/modules/person/collaborators/admission/exceptions/admission-process.messages";
import type {AdmissionProcessCreateDto} from "@/modules/person/collaborators/admission/dto/admission-process.dto";
import {
    admissionFormToPayload,
    admissionprocessToFormDto,
    emptyAdmissionProcessForm,
} from "@/modules/person/collaborators/admission/lib/admission-process.mapper";
import {admissionprocessKeys} from "@/modules/person/collaborators/admission/admission.query";
import {admissionprocessService} from "@/modules/person/collaborators/admission/services/admission-process.service";
import {storageService} from "@/modules/storage/services/storage.service";
import {DepartmentPickerField} from "@/modules/organization/department/components/DepartmentPickerField";
import {JobPositionPickerField} from "@/modules/organization/jobposition/components/JobPositionPickerField";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {EntityAttachments} from "@/shared/components/storage/EntityAttachments";
import {ExceptionCapture} from "@/shared/exceptions";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {FormStepper, type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {ProfilePhotoField} from "@/shared/components/ui/ProfilePhotoField";
import {isStepFilled, sectionHasChanges} from "@/shared/lib/form-step.util";
import {useSyncWorkspaceTabTitle} from "@/shared/workspace/useSyncWorkspaceTabTitle";
import {
    InputCEP,
    InputCPF,
    InputCurrency,
    InputDate,
    InputDecimal,
    InputRG,
    InputSelect,
    InputString,
} from "@/shared/components/ui/input/index";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

const ADMISSION_STATUS_ITEMS: SelectItem[] = [
    {value: "DRAFT", label: "Rascunho"},
    {value: "IN_PROGRESS", label: "Em andamento"},
    {value: "COMPLETED", label: "Concluída"},
    {value: "CANCELLED", label: "Cancelada"},
];

const GENDER_ITEMS: SelectItem[] = [
    {value: "MALE", label: "Masculino"},
    {value: "FEMALE", label: "Feminino"},
    {value: "OTHER", label: "Outro"},
    {value: "NOT_INFORMED", label: "Prefere não informar"},
];

const MARITAL_ITEMS: SelectItem[] = [
    {value: "SINGLE", label: "Solteiro(a)"},
    {value: "MARRIED", label: "Casado(a)"},
    {value: "DIVORCED", label: "Divorciado(a)"},
    {value: "WIDOWED", label: "Viúvo(a)"},
    {value: "OTHER", label: "Outro"},
];

const CONTRACT_TYPE_ITEMS: SelectItem[] = [
    {value: "CLT", label: "CLT"},
    {value: "PJ", label: "PJ"},
    {value: "INTERMITTENT", label: "Intermitente"},
    {value: "APPRENTICE", label: "Aprendiz"},
    {value: "INTERN", label: "Estágio"},
];

const ADMISSION_FORM_STEPS: FormStepNavItem[] = [
    {id: "dados-basicos", label: "Dados básicos"},
    {id: "processo", label: "Processo"},
    {id: "endereco", label: "Endereço"},
    {id: "documentos", label: "Documentos"},
    {id: "vinculo", label: "Vínculo"},
    {id: "observacoes", label: "Observações"},
];

export function AdmissionProcessFormClient() {
    const {editingId, isEditing, goToList, startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AdmissionProcessCreateDto>(emptyAdmissionProcessForm);
    const [error, setError] = useState<string | null>(null);
    const [pendingPhotoBlob, setPendingPhotoBlob] = useState<Blob | null>(null);
    const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
    const emptyDefaults = useMemo(() => emptyAdmissionProcessForm(), []);

    const detailQuery = useQuery({
        queryKey: admissionprocessKeys.detail(editingId ?? ""),
        queryFn: () => admissionprocessService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    const clearPendingPhoto = useCallback(() => {
        setPendingPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return null;
        });
        setPendingPhotoBlob(null);
    }, []);

    const update = <K extends keyof AdmissionProcessCreateDto>(field: K, value: AdmissionProcessCreateDto[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyAdmissionProcessForm());
            setError(null);
            clearPendingPhoto();
            return;
        }
        if (detailQuery.data) {
            setForm(admissionprocessToFormDto(detailQuery.data));
            setError(null);
            clearPendingPhoto();
        }
    }, [isEditing, detailQuery.data, clearPendingPhoto, editingId]);

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

            if (isEditing && editingId) return admissionprocessService.update(editingId, payload);
            return admissionprocessService.create(payload);
        },
        onSuccess: async () => {
            clearPendingPhoto();
            await queryClient.invalidateQueries({queryKey: admissionprocessKeys.all});
            if (editingId) await queryClient.invalidateQueries({queryKey: admissionprocessKeys.detail(editingId)});
            toast.success(isEditing ? "Admissão atualizada" : "Admissão registrada");
            setForm(emptyAdmissionProcessForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: ADMISSION_CLIENT_MESSAGES.ADMISSION_SAVE_FAILED});
            setError(ex.displayMessage);
        },
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    const attachmentsQuery = useQuery({
        queryKey: ["storage-links", "admission_process", editingId],
        queryFn: () => storageService.listLinks("admission_process", editingId!),
        enabled: Boolean(editingId),
    });

    const filledStepIds = useMemo(() => {
        const empty = emptyDefaults;
        const filled: string[] = [];

        const dadosKeys = [
            "fullName", "socialName", "cpf", "rg", "birthDate", "gender", "maritalStatus",
            "nationality", "pisPasep", "motherName", "fatherName", "email", "phone",
        ] as const;

        if (
            sectionHasChanges(form, empty, [...dadosKeys])
            || isStepFilled([{value: form.photoObjectId}, {value: pendingPreviewUrl}])
        ) {
            filled.push("dados-basicos");
        }

        if (
            sectionHasChanges(form, empty, ["admissionStatus", "startedAt"])
            || (form.admissionStatus != null && form.admissionStatus !== "DRAFT")
        ) {
            filled.push("processo");
        }

        if (
            isStepFilled([
                {value: form.zipCode},
                {value: form.stateCode},
                {value: form.street},
                {value: form.number},
                {value: form.complement},
                {value: form.district},
                {value: form.city},
            ])
        ) {
            filled.push("endereco");
        }

        if ((attachmentsQuery.data?.length ?? 0) > 0) {
            filled.push("documentos");
        }

        if (
            sectionHasChanges(form, empty, [
                "expectedStartDate", "contractType", "baseSalary", "workloadHours",
                "companyId", "departmentId", "jobPositionId",
            ])
        ) {
            filled.push("vinculo");
        }

        if (isStepFilled([{value: form.notes}])) {
            filled.push("observacoes");
        }

        return filled;
    }, [form, emptyDefaults, pendingPreviewUrl, attachmentsQuery.data]);

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
                    {ExceptionCapture.displayMessage(detailQuery.error, ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED)}
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
            bodyClassName="!overflow-hidden !p-0"
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
            <FormStepper
                key={editingId ?? "new"}
                steps={ADMISSION_FORM_STEPS}
                filledStepIds={filledStepIds}
                entityCode={isEditing ? detailQuery.data?.code : undefined}
            >
                <FormSection
                    id="dados-basicos"
                    title="Dados básicos"
                    description="Identificação pessoal e contato do colaborador."
                    bodyClassName="!block"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <ProfilePhotoField
                            photoObjectId={form.photoObjectId || undefined}
                            pendingPreviewUrl={pendingPreviewUrl}
                            onCropComplete={handlePhotoCropComplete}
                            onClear={handlePhotoClear}
                            displayName={form.fullName || "Colaborador"}
                        />
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
                            <InputCPF
                                label="CPF"
                                value={form.cpf}
                                onValueChange={(v) => update("cpf", v)}
                                required
                                hint="Salvo apenas com dígitos"
                            />
                            <InputRG label="RG" value={form.rg ?? ""} onValueChange={(v) => update("rg", v)}/>
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
                                onValueChange={(v) => update("gender", (v || undefined) as AdmissionProcessCreateDto["gender"])}
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
                            <InputString label="PIS/PASEP" value={form.pisPasep ?? ""}
                                         onValueChange={(v) => update("pisPasep", v)}/>
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
                            <InputString label="E-mail" value={form.email ?? ""} onValueChange={(v) => update("email", v)}/>
                            <InputString
                                label="Telefone / WhatsApp"
                                value={form.phone ?? ""}
                                onValueChange={(v) => update("phone", v)}
                            />
                        </div>
                    </div>
                </FormSection>

                <FormSection
                    id="processo"
                    title="Processo"
                    description="Status e datas do fluxo de admissão."
                >
                    <InputSelect
                        label="Status do processo"
                        items={ADMISSION_STATUS_ITEMS}
                        value={form.admissionStatus ?? "DRAFT"}
                        onValueChange={(v) =>
                            update(
                                "admissionStatus",
                                (v || "DRAFT") as AdmissionProcessCreateDto["admissionStatus"],
                            )
                        }
                        required
                    />
                    <InputDate
                        label="Data de abertura"
                        value={form.startedAt ?? ""}
                        onValueChange={(v) => update("startedAt", v)}
                    />
                </FormSection>

                <FormSection
                    id="endereco"
                    title="Endereço"
                    description="Residência principal informada na admissão."
                >
                    <InputCEP label="CEP" value={form.zipCode ?? ""} onValueChange={(v) => update("zipCode", v)}/>
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
                    <InputString label="Número" value={form.number ?? ""}
                                 onValueChange={(v) => update("number", v)}/>
                    <InputString
                        label="Complemento"
                        value={form.complement ?? ""}
                        onValueChange={(v) => update("complement", v)}
                    />
                    <InputString label="Bairro" value={form.district ?? ""}
                                 onValueChange={(v) => update("district", v)}/>
                    <InputString label="Cidade" value={form.city ?? ""} onValueChange={(v) => update("city", v)}/>
                </FormSection>

                <FormSection
                    id="documentos"
                    title="Documentos"
                    description="Anexos vinculados ao processo de admissão."
                    bodyClassName="!block"
                >
                    <EntityAttachments entityType="admission_process" entityId={editingId}/>
                </FormSection>

                <FormSection
                    id="vinculo"
                    title="Vínculo previsto"
                    description="Contrato e alocação organizacional."
                >
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
                        onValueChange={(v) =>
                            update("contractType", (v || "CLT") as AdmissionProcessCreateDto["contractType"])
                        }
                        required
                    />
                    <InputCurrency
                        label="Salário base"
                        value={form.baseSalary != null ? String(form.baseSalary) : ""}
                        onValueChange={(v) => update("baseSalary", v)}
                        emitAsDecimal
                    />
                    <InputDecimal
                        label="Carga horária semanal"
                        value={form.workloadHours != null ? String(form.workloadHours) : ""}
                        onValueChange={(v) => update("workloadHours", v)}
                    />
                    <InputString
                        label="ID empresa (opcional)"
                        value={form.companyId ?? ""}
                        onValueChange={(v) => update("companyId", v)}
                        hint="UUID da empresa"
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
            </FormStepper>
        </CrudFormShell>
    );
}
