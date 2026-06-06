"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/admission/exceptions/admission-process.messages";
import type { AdmissionProcessCreateDto } from "@/modules/admission/dto/admission-process.dto";
import {
    admissionFormToPayload,
    admissionprocessToFormDto,
    emptyAdmissionProcessForm,
} from "@/modules/admission/lib/admission-process.mapper";
import { admissionprocessKeys } from "@/modules/admission/admission.query";
import { admissionprocessService } from "@/modules/admission/services/admission-process.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";
import { EntityAttachments } from "@/shared/components/storage/EntityAttachments";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import {
    InputCEP,
    InputCPF,
    InputCurrency,
    InputDate,
    InputNumber,
    RgIdentityFields,
    InputSelect,
    InputString,
} from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

const ADMISSION_STATUS_ITEMS: SelectItem[] = [
    { value: "DRAFT", label: "Rascunho" },
    { value: "IN_PROGRESS", label: "Em andamento" },
    { value: "COMPLETED", label: "Concluída" },
    { value: "CANCELLED", label: "Cancelada" },
];

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

const CONTRACT_TYPE_ITEMS: SelectItem[] = [
    { value: "CLT", label: "CLT" },
    { value: "PJ", label: "PJ" },
    { value: "INTERMITTENT", label: "Intermitente" },
    { value: "APPRENTICE", label: "Aprendiz" },
    { value: "INTERN", label: "Estágio" },
];

export function AdmissionProcessFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AdmissionProcessCreateDto>(emptyAdmissionProcessForm);
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: admissionprocessKeys.detail(editingId ?? ""),
        queryFn: () => admissionprocessService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyAdmissionProcessForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(admissionprocessToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: AdmissionProcessCreateDto) => {
            const payload = admissionFormToPayload(dto);
            if (isEditing && editingId) return admissionprocessService.update(editingId, payload);
            return admissionprocessService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: admissionprocessKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: admissionprocessKeys.detail(editingId) });
            toast.success(isEditing ? "Admissão atualizada" : "Admissão registrada");
            setForm(emptyAdmissionProcessForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: ADMISSION_CLIENT_MESSAGES.ADMISSION_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof AdmissionProcessCreateDto>(field: K, value: AdmissionProcessCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="gommo-crud-panel-inset grid gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="gommo-crud-panel-inset">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(detailQuery.error, ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED)}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    const linkedCollaboratorId = detailQuery.data?.collaboratorId;

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
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
            <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <p className="text-sm font-semibold text-base-content">
                        {isEditing ? "Editar admissão" : "Nova admissão"}
                    </p>
                    <p className="text-xs text-base-content/45">
                        Ao salvar, o sistema cria o colaborador com endereço e contato e vincula este processo de
                        admissão.
                    </p>
                    {linkedCollaboratorId && (
                        <p className="mt-1 text-xs text-primary">
                            Colaborador vinculado: {linkedCollaboratorId.slice(0, 8)}…
                        </p>
                    )}
                </div>

                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
                <FormSection title="Processo" description="Status e datas do fluxo de admissão.">
                    <InputSelect
                        label="Status do processo"
                        items={ADMISSION_STATUS_ITEMS}
                        value={form.admissionStatus ?? "DRAFT"}
                        onValueChange={(v) =>
                            update("admissionStatus", (v || "DRAFT") as AdmissionProcessCreateDto["admissionStatus"])
                        }
                        required
                    />
                    <InputDate
                        label="Data de abertura"
                        value={form.startedAt ?? ""}
                        onValueChange={(v) => update("startedAt", v)}
                    />
                    <InputString
                        label="Observações internas"
                        value={form.notes ?? ""}
                        onValueChange={(v) => update("notes", v)}
                        wrapperClassName="sm:col-span-2"
                    />
                </FormSection>

                <FormSection title="Dados básicos" description="Identificação pessoal do futuro colaborador.">
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
                    <InputString label="PIS/PASEP" value={form.pisPasep ?? ""} onValueChange={(v) => update("pisPasep", v)} />
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
                </FormSection>

                <FormSection title="Endereço" description="Residência principal informada na admissão.">
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

                <FormSection title="Contato" description="Canais de comunicação do colaborador.">
                    <InputString label="E-mail" value={form.email ?? ""} onValueChange={(v) => update("email", v)} />
                    <InputString
                        label="Telefone / WhatsApp"
                        value={form.phone ?? ""}
                        onValueChange={(v) => update("phone", v)}
                    />
                </FormSection>

                <FormSection title="Vínculo previsto" description="Contrato e alocação organizacional.">
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
                    <InputNumber
                        label="Carga horária semanal"
                        integer
                        suffix="h"
                        align="left"
                        value={form.workloadHours}
                        onValueChange={(v) => update("workloadHours", v ?? undefined)}
                    />
                    <InputString
                        label="ID empresa (opcional)"
                        value={form.companyId ?? ""}
                        onValueChange={(v) => update("companyId", v)}
                        hint="UUID da empresa"
                    />
                    <InputString
                        label="ID departamento (opcional)"
                        value={form.departmentId ?? ""}
                        onValueChange={(v) => update("departmentId", v)}
                        hint="UUID do departamento"
                    />
                    <InputString
                        label="ID cargo (opcional)"
                        value={form.jobPositionId ?? ""}
                        onValueChange={(v) => update("jobPositionId", v)}
                        hint="UUID do cargo"
                        wrapperClassName="sm:col-span-2"
                    />
                </FormSection>

                {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
                </div>

                <FormSection
                title="Documentos"
                description="Anexos vinculados ao processo de admissão (armazenamento local)."
            >
                <div className="sm:col-span-2">
                    <EntityAttachments entityType="admission_process" entityId={editingId} />
                </div>
            </FormSection>
            </div>
        </CrudFormShell>
    );
}
