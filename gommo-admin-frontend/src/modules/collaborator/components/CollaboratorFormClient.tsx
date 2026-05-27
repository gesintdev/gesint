"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { COLLABORATOR_CLIENT_MESSAGES } from "@/modules/collaborator/exceptions/collaborator.messages";
import type { CollaboratorCreateDto } from "@/modules/collaborator/dto/collaborator.dto";
import {
    collaboratorFormToPayload,
    collaboratorToFormDto,
    emptyCollaboratorForm,
} from "@/modules/collaborator/lib/collaborator.mapper";
import { collaboratorKeys } from "@/modules/collaborator/collaborator.query";
import { collaboratorService } from "@/modules/collaborator/services/collaborator.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";
import { ExceptionCapture } from "@/shared/exceptions";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import {
    InputCPF,
    InputDate,
    InputRG,
    InputSelect,
    InputString,
} from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

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

export function CollaboratorFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<CollaboratorCreateDto>(emptyCollaboratorForm);
    const [error, setError] = useState<string | null>(null);

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
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: CollaboratorCreateDto) => {
            if (!editingId) throw new Error("Edição requer colaborador selecionado");
            return collaboratorService.update(editingId, collaboratorFormToPayload(dto));
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: collaboratorKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: collaboratorKeys.detail(editingId) });
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
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (!isEditing) {
        return (
            <div className="flex min-h-[12rem] items-center justify-center p-8 text-center text-sm text-base-content/50">
                Selecione uma pessoa na listagem para editar os dados pessoais.
            </div>
        );
    }

    if (detailQuery.isLoading) {
        return (
            <div className="gommo-crud-panel-inset grid gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (detailQuery.isError) {
        return (
            <div className="gommo-crud-panel-inset">
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
            <div className="flex flex-col gap-4">
                <div className="sm:col-span-2">
                    <p className="text-sm font-semibold text-base-content">Editar dados pessoais</p>
                    <p className="text-xs text-base-content/45">
                        Alterações aqui não substituem o fluxo de admissão para novos colaboradores.
                    </p>
                </div>

                <FormSection title="Identificação" description="Dados pessoais do colaborador.">
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
                    <InputRG label="RG" value={form.rg ?? ""} onValueChange={(v) => update("rg", v)} />
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

                {error && <p className="text-sm font-medium text-error">{error}</p>}
            </div>
        </CrudFormShell>
    );
}
