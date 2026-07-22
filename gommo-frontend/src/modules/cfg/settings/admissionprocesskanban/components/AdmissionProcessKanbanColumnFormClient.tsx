"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import type { AdmissionProcessKanbanColumnCreateDto } from "@/modules/cfg/settings/admissionprocesskanban/dto/admission-process-kanban-column.dto";
import { admissionProcessKanbanColumnKeys } from "@/modules/cfg/settings/admissionprocesskanban/admission-process-kanban-column.query";
import {
    admissionProcessKanbanColumnToFormDto,
    emptyAdmissionProcessKanbanColumnForm,
    keyFromColumnName,
} from "@/modules/cfg/settings/admissionprocesskanban/lib/admission-process-kanban-column.mapper";
import { admissionProcessKanbanColumnService } from "@/modules/cfg/settings/admissionprocesskanban/services/admission-process-kanban-column.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputColor, InputNumber, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Coluna" }];

export function AdmissionProcessKanbanColumnFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AdmissionProcessKanbanColumnCreateDto>(
        emptyAdmissionProcessKanbanColumnForm,
    );
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: admissionProcessKanbanColumnKeys.detail(editingId ?? ""),
        queryFn: () => admissionProcessKanbanColumnService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyAdmissionProcessKanbanColumnForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(admissionProcessKanbanColumnToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: AdmissionProcessKanbanColumnCreateDto) => {
            const color = dto.color?.trim() || null;
            const payload = {
                ...dto,
                columnKey: dto.columnKey || keyFromColumnName(dto.name),
                color,
                displayOrder: dto.displayOrder ?? 0,
            };
            if (isEditing && editingId) return admissionProcessKanbanColumnService.update(editingId, payload);
            return admissionProcessKanbanColumnService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: admissionProcessKanbanColumnKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({
                    queryKey: admissionProcessKanbanColumnKeys.detail(editingId),
                });
            }
            toast.success(isEditing ? "Coluna atualizada" : "Coluna cadastrada");
            setForm(emptyAdmissionProcessKanbanColumnForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar a coluna.",
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof AdmissionProcessKanbanColumnCreateDto>(
        field: K,
        value: AdmissionProcessKanbanColumnCreateDto[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const updateName = (value: string) => {
        setForm((prev) => ({
            ...prev,
            name: value,
            columnKey: prev.columnKey || keyFromColumnName(value),
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
                    {ExceptionCapture.displayMessage(detailQuery.error, "Não foi possível carregar a coluna.")}
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
            <FormSection id="cadastro" title="Coluna do kanban" description="Etapas do processo de admissão.">
                <InputString
                    label="Nome"
                    value={form.name ?? ""}
                    onValueChange={updateName}
                    wrapperClassName="sm:col-span-6"
                    required
                />
                <InputString
                    label="Chave"
                    value={form.columnKey ?? ""}
                    onValueChange={(v) => update("columnKey", keyFromColumnName(v))}
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
                <InputColor
                    label="Cor"
                    value={form.color ?? ""}
                    onValueChange={(v) => update("color", v)}
                    wrapperClassName="sm:col-span-4"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
