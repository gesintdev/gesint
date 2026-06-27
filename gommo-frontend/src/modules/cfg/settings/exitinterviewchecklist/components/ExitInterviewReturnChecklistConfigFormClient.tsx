"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ExitInterviewReturnChecklistConfigCreateDto } from "@/modules/cfg/settings/exitinterviewchecklist/dto/exit-interview-return-checklist-config.dto";
import { exitInterviewReturnChecklistConfigKeys } from "@/modules/cfg/settings/exitinterviewchecklist/exitinterviewchecklist.query";
import {
    emptyExitInterviewReturnChecklistConfigForm,
    exitInterviewReturnChecklistConfigToFormDto,
    keyFromDescription,
} from "@/modules/cfg/settings/exitinterviewchecklist/lib/exit-interview-return-checklist-config.mapper";
import { exitInterviewReturnChecklistConfigService } from "@/modules/cfg/settings/exitinterviewchecklist/services/exit-interview-return-checklist-config.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputNumber, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Item" }];

export function ExitInterviewReturnChecklistConfigFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ExitInterviewReturnChecklistConfigCreateDto>(
        emptyExitInterviewReturnChecklistConfigForm,
    );
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: exitInterviewReturnChecklistConfigKeys.detail(editingId ?? ""),
        queryFn: () => exitInterviewReturnChecklistConfigService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyExitInterviewReturnChecklistConfigForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(exitInterviewReturnChecklistConfigToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: ExitInterviewReturnChecklistConfigCreateDto) => {
            const payload = {
                ...dto,
                itemKey: dto.itemKey || keyFromDescription(dto.description),
                displayOrder: dto.displayOrder ?? 0,
            };
            if (isEditing && editingId) return exitInterviewReturnChecklistConfigService.update(editingId, payload);
            return exitInterviewReturnChecklistConfigService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: exitInterviewReturnChecklistConfigKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({
                    queryKey: exitInterviewReturnChecklistConfigKeys.detail(editingId),
                });
            }
            toast.success(isEditing ? "Item de devolução atualizado" : "Item de devolução cadastrado");
            setForm(emptyExitInterviewReturnChecklistConfigForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar o item de devolução.",
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof ExitInterviewReturnChecklistConfigCreateDto>(
        field: K,
        value: ExitInterviewReturnChecklistConfigCreateDto[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateDescription = (value: string) => {
        setForm((prev) => ({
            ...prev,
            description: value,
            itemKey: prev.itemKey || keyFromDescription(value),
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(detailQuery.error, "Não foi possível carregar o item.")}
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
                    {isEditing ? (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    ) : null}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="cadastro" title="Item de devolução">
                <InputString
                    label="Descrição"
                    value={form.description ?? ""}
                    onValueChange={updateDescription}
                    wrapperClassName="sm:col-span-6"
                    required
                />
                <InputString
                    label="Chave"
                    value={form.itemKey ?? ""}
                    onValueChange={(v) => update("itemKey", keyFromDescription(v))}
                    wrapperClassName="sm:col-span-4"
                    required
                />
                <InputNumber
                    label="Ordem"
                    value={form.displayOrder ?? 0}
                    onValueChange={(v) => update("displayOrder", v ?? 0)}
                    wrapperClassName="sm:col-span-2"
                    integer
                    required
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
