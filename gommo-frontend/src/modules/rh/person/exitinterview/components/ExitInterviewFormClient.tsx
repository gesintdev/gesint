"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent,useEffect, useState } from "react";
import { toast } from "sonner";

import type { ExitInterviewCreateDto } from "@/modules/rh/person/exitinterview/dto/exit-interview.dto";
import { EXITINTERVIEW_CLIENT_MESSAGES } from "@/modules/rh/person/exitinterview/exceptions/exit-interview.messages";
import { exitinterviewKeys } from "@/modules/rh/person/exitinterview/exitinterview.query";
import {
    emptyExitInterviewForm,
    exitinterviewToFormDto,
} from "@/modules/rh/person/exitinterview/lib/exit-interview.mapper";
import { exitinterviewService } from "@/modules/rh/person/exitinterview/services/exit-interview.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputDate,InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Entrevista" }];

export function ExitInterviewFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ExitInterviewCreateDto>(emptyExitInterviewForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: exitinterviewKeys.detail(editingId ?? ""),
        queryFn: () => exitinterviewService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyExitInterviewForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(exitinterviewToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: ExitInterviewCreateDto) => {
            if (isEditing && editingId) return exitinterviewService.update(editingId, dto);
            return exitinterviewService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.detail(editingId) });
            toast.success(
                isEditing ? "Entrevista de desligamento atualizado(a)" : "Entrevista de desligamento cadastrado(a)",
            );
            setForm(emptyExitInterviewForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: EXITINTERVIEW_CLIENT_MESSAGES.EXITINTERVIEW_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof ExitInterviewCreateDto>(field: K, value: ExitInterviewCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
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
                        EXITINTERVIEW_CLIENT_MESSAGES.EXITINTERVIEW_LOAD_FAILED,
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
            <FormSection id="cadastro" title="Entrevista">
                <div className="sm:col-span-12">
                    <CollaboratorPickerField
                        value={form.collaboratorId ?? ""}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                    />
                </div>
                <InputDate
                    label="Data da entrevista"
                    value={form.interviewDate ?? ""}
                    onValueChange={(v) => update("interviewDate", v)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Motivo da saída"
                    value={form.departureReason ?? ""}
                    onValueChange={(v) => update("departureReason", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Feedback"
                    value={form.feedback ?? ""}
                    onValueChange={(v) => update("feedback", v)}
                    wrapperClassName="sm:col-span-12"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
