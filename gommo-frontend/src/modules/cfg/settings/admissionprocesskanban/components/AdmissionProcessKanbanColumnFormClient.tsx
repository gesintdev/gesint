"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { type FormEvent, useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { admissionProcessKanbanColumnKeys } from "@/modules/cfg/settings/admissionprocesskanban/admission-process-kanban-column.query";
import type { AdmissionProcessKanbanColumnCreateDto } from "@/modules/cfg/settings/admissionprocesskanban/dto/admission-process-kanban-column.dto";
import {
    admissionProcessKanbanColumnToFormDto,
    emptyAdmissionProcessKanbanColumnForm,
    keyFromColumnName,
} from "@/modules/cfg/settings/admissionprocesskanban/lib/admission-process-kanban-column.mapper";
import { admissionProcessKanbanColumnService } from "@/modules/cfg/settings/admissionprocesskanban/services/admission-process-kanban-column.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputCheckbox, InputColor, InputNumber, InputString } from "@/shared/components/ui/input/index";
import { InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Coluna" }];
const DEFAULT_SLA_BUSINESS_DAYS = 5;
const MIN_SLA_BUSINESS_DAYS = 1;
const MAX_SLA_BUSINESS_DAYS = 90;

function clampSlaBusinessDays(value: number | null | undefined): number {
    const resolved = value ?? DEFAULT_SLA_BUSINESS_DAYS;
    return Math.max(MIN_SLA_BUSINESS_DAYS, Math.min(MAX_SLA_BUSINESS_DAYS, resolved));
}

export function AdmissionProcessKanbanColumnFormClient() {
    const { editingId, isEditing, goToList, showSavedRecord, startCreate } = useCrudScreen();
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
    const isSystemColumn = isEditing && Boolean(detailQuery.data?.systemColumn);
    const slaEnabled = form.slaEnabled ?? true;
    const slaEnabledFieldId = useId();

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
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: admissionProcessKanbanColumnToFormDto,
        getEmptyForm: () => emptyAdmissionProcessKanbanColumnForm(),
    });

    const saveMutation = useMutation({
        mutationFn: async (dto: AdmissionProcessKanbanColumnCreateDto) => {
            const color = dto.color?.trim() || null;
            const payload: AdmissionProcessKanbanColumnCreateDto = {
                ...dto,
                columnKey: dto.columnKey || keyFromColumnName(dto.name),
                color,
                displayOrder: dto.displayOrder ?? 0,
                slaBusinessDays: clampSlaBusinessDays(dto.slaBusinessDays),
            };
            if (isEditing && editingId) return admissionProcessKanbanColumnService.update(editingId, payload);
            return admissionProcessKanbanColumnService.create(payload);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({ queryKey: admissionProcessKanbanColumnKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({
                    queryKey: admissionProcessKanbanColumnKeys.detail(editingId),
                });
            }
            toast.success(isEditing ? "Coluna atualizada" : "Coluna cadastrada");
            void showSavedRecord(saved.id, saved);
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
                    <Button type="button" variant="outline" onClick={startCreate}>
                        Novo cadastro
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="cadastro"
                title="Coluna do kanban"
                description="Etapas do processo de admissão. Prazo padrão: 5 dias úteis; zera ao mudar de etapa."
            >
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
                    readOnly={isSystemColumn}
                    hint={isSystemColumn ? "Coluna do sistema: a chave não pode ser alterada." : undefined}
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
                {isSystemColumn ? (
                    <p className="sm:col-span-8 self-end pb-2 text-sm text-base-content/55">
                        Colunas do sistema (como Encerrados) não monitoram prazo na etapa.
                    </p>
                ) : (
                    <div className="sm:col-span-8 flex flex-wrap items-start gap-2.5">
                        <InputFieldChrome
                            label="Monitorar prazo"
                            id={slaEnabledFieldId}
                            labelFor={false}
                            wrapperClassName="w-max shrink-0"
                        >
                            <InputCheckbox
                                size="xs"
                                checked={slaEnabled}
                                onCheckedChange={(checked) => update("slaEnabled", checked)}
                                label="Ativo na etapa"
                                className={clsx(
                                    "min-h-9 w-max rounded-lg border px-3 py-2 transition-colors",
                                    slaEnabled
                                        ? "border-primary/35 bg-primary/8 text-primary"
                                        : "border-base-300/50 bg-base-200/20 text-base-content/85 hover:bg-base-200/40",
                                )}
                                labelClassName={clsx(
                                    "text-sm whitespace-nowrap",
                                    slaEnabled ? "font-medium text-primary" : "text-base-content/75",
                                )}
                            />
                        </InputFieldChrome>
                        <InputNumber
                            label="Prazo máximo parado"
                            value={form.slaBusinessDays ?? null}
                            onValueChange={(v) => update("slaBusinessDays", v ?? undefined)}
                            wrapperClassName="w-[12rem] shrink-0"
                            integer
                            decimalPlaces={0}
                            thousandSeparator={false}
                            align="left"
                            suffix="dias úteis"
                            disabled={!slaEnabled}
                        />
                    </div>
                )}
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
