"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { CandidateExperiencesEditor } from "@/modules/rh/person/candidate/components/CandidateExperiencesEditor";
import { candidateKeys } from "@/modules/rh/person/candidate/candidate.query";
import type { CandidateCreateDto } from "@/modules/rh/person/candidate/dto/candidate.dto";
import { CANDIDATE_CLIENT_MESSAGES } from "@/modules/rh/person/candidate/exceptions/candidate.messages";
import {
    candidateFormToPayload,
    candidateToFormDto,
    emptyCandidateForm,
} from "@/modules/rh/person/candidate/lib/candidate.mapper";
import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { EntityAttachments } from "@/shared/components/storage/EntityAttachments";
import { Button } from "@/shared/components/ui/Button";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputCPF, InputDate, InputPhone, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Dados" },
    { id: "experiencia", label: "Experiência" },
    { id: "curriculo", label: "Currículo" },
];

export function CandidateFormClient() {
    const { editingId, isEditing, goToList, showSavedRecord, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<CandidateCreateDto>(emptyCandidateForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: candidateKeys.detail(editingId ?? ""),
        queryFn: () => candidateService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyCandidateForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(candidateToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: candidateToFormDto,
        getEmptyForm: () => emptyCandidateForm(),
    });


    const saveMutation = useMutation({
        mutationFn: async (dto: CandidateCreateDto) => {
            const payload = candidateFormToPayload(dto);
            if (isEditing && editingId) return candidateService.update(editingId, payload);
            return candidateService.create(payload);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({ queryKey: candidateKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: candidateKeys.detail(editingId) });
            toast.success(isEditing ? "Candidato atualizado" : "Candidato cadastrado");
            void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: CANDIDATE_CLIENT_MESSAGES.CANDIDATE_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof CandidateCreateDto>(field: K, value: CandidateCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.fullName.trim()) {
            setError("Informe o nome do candidato.");
            return;
        }
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <SkeletonStack count={4} padded />
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        CANDIDATE_CLIENT_MESSAGES.CANDIDATE_LOAD_FAILED,
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
                    <Button type="button" variant="outline" onClick={startCreate}>
                        Novo cadastro
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="dados" title="Dados do candidato">
                <InputString
                    label="Nome completo"
                    value={form.fullName}
                    onValueChange={(v) => update("fullName", v)}
                    required
                    wrapperClassName="sm:col-span-8"
                />
                <InputCPF
                    label="CPF"
                    value={form.cpf}
                    onValueChange={(v) => update("cpf", v)}
                    hint="Opcional até a pré-admissão (RN-02)."
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="E-mail"
                    value={form.email ?? ""}
                    onValueChange={(v) => update("email", v)}
                    wrapperClassName="sm:col-span-5"
                />
                <InputPhone
                    label="Telefone"
                    value={form.phone ?? ""}
                    onValueChange={(v) => update("phone", v)}
                    wrapperClassName="sm:col-span-3"
                />
                <InputDate
                    label="Data de nascimento"
                    value={form.birthDate ?? ""}
                    onValueChange={(v) => update("birthDate", v)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Cidade"
                    value={form.city ?? ""}
                    onValueChange={(v) => update("city", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="UF"
                    value={form.stateCode ?? ""}
                    onValueChange={(v) => update("stateCode", v.toUpperCase().slice(0, 2))}
                    maxLength={2}
                    wrapperClassName="sm:col-span-2"
                />
                <InputString
                    label="LinkedIn"
                    value={form.linkedinUrl ?? ""}
                    onValueChange={(v) => update("linkedinUrl", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Portfólio / GitHub"
                    value={form.portfolioUrl ?? ""}
                    onValueChange={(v) => update("portfolioUrl", v)}
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>
            <FormSection id="experiencia" title="Experiência profissional">
                <CandidateExperiencesEditor
                    experiences={form.experiences ?? []}
                    onChange={(experiences) => update("experiences", experiences)}
                />
            </FormSection>
            <FormSection id="curriculo" title="Currículo">
                {isEditing && editingId ? (
                    <div className="sm:col-span-12">
                        <EntityAttachments
                            entityType="candidate"
                            entityId={editingId}
                            linkRole="CURRICULUM"
                            emptyMessage="Nenhum currículo anexado."
                        />
                    </div>
                ) : (
                    <p className="sm:col-span-12 text-sm text-base-content/55">
                        Salve o candidato para anexar o currículo.
                    </p>
                )}
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
