"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type SubmitEvent, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";
import {COLLABORATOR_CLIENT_MESSAGES} from "@/modules/person/collaborators/people/exceptions/collaborator.messages";
import type {CollaboratorCreateDto} from "@/modules/person/collaborators/people/dto/collaborator.dto";
import {
    collaboratorFormToPayload,
    collaboratorToFormDto,
    emptyCollaboratorForm,
} from "@/modules/person/collaborators/people/lib/collaborator.mapper";
import {collaboratorKeys} from "@/modules/person/collaborators/people/collaborator.query";
import {collaboratorService} from "@/modules/person/collaborators/people/services/collaborator.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useSyncWorkspaceTabTitle} from "@/shared/workspace/useSyncWorkspaceTabTitle";
import {ExceptionCapture} from "@/shared/exceptions";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {FormStepper, type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {sectionHasChanges} from "@/shared/lib/form-step.util";
import {InputCPF, InputDate, InputSelect, InputString, RgIdentityFields} from "@/shared/components/ui/input/index";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

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

const COLLABORATOR_FORM_STEPS: FormStepNavItem[] = [
    {id: "identificacao", label: "Identificação"},
    {id: "filiacao", label: "Filiação"},
];

export function CollaboratorFormClient() {
    const {editingId, isEditing, goToList} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<CollaboratorCreateDto>(emptyCollaboratorForm);
    const [error, setError] = useState<string | null>(null);
    const emptyDefaults = useMemo(() => emptyCollaboratorForm(), []);

    const detailQuery = useQuery({
        queryKey: collaboratorKeys.detail(editingId ?? ""),
        queryFn: () => collaboratorService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyCollaboratorForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(collaboratorToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data, editingId]);

    const saveMutation = useMutation({
        mutationFn: async (dto: CollaboratorCreateDto) => {
            if (!editingId) throw new Error("Edição requer colaborador selecionado");
            return collaboratorService.update(editingId, collaboratorFormToPayload(dto));
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: collaboratorKeys.all});
            if (editingId) await queryClient.invalidateQueries({queryKey: collaboratorKeys.detail(editingId)});
            toast.success("Dados pessoais atualizados");
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: COLLABORATOR_CLIENT_MESSAGES.COLLABORATOR_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof CollaboratorCreateDto>(field: K, value: CollaboratorCreateDto[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    const filledStepIds = useMemo(() => {
        const empty = emptyDefaults;
        const filled: string[] = [];

        if (sectionHasChanges(form, empty, ["fullName", "socialName", "cpf", "rg", "rgIssuer", "rgStateCode", "birthDate", "gender", "maritalStatus"])) {
            filled.push("identificacao");
        }

        if (sectionHasChanges(form, empty, ["nationality", "pisPasep", "motherName", "fatherName"])) {
            filled.push("filiacao");
        }

        return filled;
    }, [form, emptyDefaults]);

    if (!isEditing) {
        return (
            <div
                className="flex min-h-[12rem] items-center justify-center p-8 text-center text-sm text-base-content/50">
                Selecione uma pessoa na listagem para editar os dados pessoais.
            </div>
        );
    }

    if (detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full"/>
                ))}
            </div>
        );
    }

    if (detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        COLLABORATOR_CLIENT_MESSAGES.COLLABORATOR_LOAD_FAILED,
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
            bodyClassName="!overflow-hidden !p-0"
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        Salvar
                    </Button>
                </>
            }
        >
            <FormStepper
                key={editingId ?? "new"}
                steps={COLLABORATOR_FORM_STEPS}
                filledStepIds={filledStepIds}
                entityCode={detailQuery.data?.code}
            >
                <FormSection id="identificacao" title="Identificação" description="Dados pessoais do colaborador.">
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
                        onValueChange={(v) =>
                            update("gender", (v || undefined) as CollaboratorCreateDto["gender"])
                        }
                        placeholder="Não informado"
                        clearable
                    />
                    <InputSelect
                        label="Estado civil"
                        items={MARITAL_ITEMS}
                        value={form.maritalStatus ?? ""}
                        onValueChange={(v) =>
                            update("maritalStatus", (v || undefined) as CollaboratorCreateDto["maritalStatus"])
                        }
                        placeholder="Não informado"
                        clearable
                    />
                </FormSection>

                <FormSection id="filiacao" title="Filiação" description="Nacionalidade, documentos e filiação.">
                    <InputString
                        label="Nacionalidade"
                        value={form.nationality ?? ""}
                        onValueChange={(v) => update("nationality", v)}
                    />
                    <InputString
                        label="PIS/PASEP"
                        value={form.pisPasep ?? ""}
                        onValueChange={(v) => update("pisPasep", v)}
                    />
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

                {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
            </FormStepper>
        </CrudFormShell>
    );
}
