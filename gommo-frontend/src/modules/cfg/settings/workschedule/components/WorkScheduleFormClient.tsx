"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import type {
    WorkScheduleCreateDto,
    WorkScheduleDayCreateDto,
} from "@/modules/cfg/settings/workschedule/dto/work-schedule.dto";
import {
    dayMainBreak,
    dayTotalHours,
    emptyWorkScheduleForm,
    WEEK_DAY_LABELS,
    weeklyTotalHours,
    workScheduleToFormDto,
} from "@/modules/cfg/settings/workschedule/lib/work-schedule.mapper";
import { workScheduleService } from "@/modules/cfg/settings/workschedule/services/work-schedule.service";
import { workScheduleKeys } from "@/modules/cfg/settings/workschedule/workschedule.query";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputHour, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Dados" },
    { id: "quadro", label: "Quadro de horários" },
];

type DayTimeField = keyof Pick<
    WorkScheduleDayCreateDto,
    "period1Start" | "period1End" | "period2Start" | "period2End"
>;

export function WorkScheduleFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<WorkScheduleCreateDto>(emptyWorkScheduleForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: workScheduleKeys.detail(editingId ?? ""),
        queryFn: () => workScheduleService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyWorkScheduleForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(workScheduleToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: WorkScheduleCreateDto) => {
            const payload: WorkScheduleCreateDto = {
                name: dto.name.trim(),
                description: dto.description?.trim() || undefined,
                days: dto.days.map((day) => ({
                    dayOfWeek: day.dayOfWeek,
                    period1Start: day.period1Start || undefined,
                    period1End: day.period1End || undefined,
                    period2Start: day.period2Start || undefined,
                    period2End: day.period2End || undefined,
                })),
            };
            if (isEditing && editingId) return workScheduleService.update(editingId, payload);
            return workScheduleService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: workScheduleKeys.all });
            await queryClient.invalidateQueries({ queryKey: workScheduleKeys.active });
            if (editingId) {
                await queryClient.invalidateQueries({ queryKey: workScheduleKeys.detail(editingId) });
            }
            toast.success(isEditing ? "Escala atualizada" : "Escala cadastrada");
            setForm(emptyWorkScheduleForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar a escala.",
            });
            setError(ex.displayMessage);
        },
    });

    const updateDay = (dayOfWeek: string, field: DayTimeField, value: string) => {
        setForm((prev) => ({
            ...prev,
            days: prev.days.map((day) =>
                day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day,
            ),
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.name.trim()) {
            setError("Informe o nome da escala.");
            return;
        }
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
                    {ExceptionCapture.displayMessage(detailQuery.error, "Não foi possível carregar a escala.")}
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
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="dados" title="Dados da escala" description="Identificação da jornada.">
                <InputString
                    label="Nome"
                    value={form.name}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, name: v }))}
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Descrição"
                    value={form.description ?? ""}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, description: v }))}
                    wrapperClassName="sm:col-span-8"
                />
            </FormSection>

            <FormSection
                id="quadro"
                title="Quadro de horários"
                description="Defina entrada/saída do primeiro tempo e entrada/encerramento do segundo tempo."
                bodyClassName="!block"
            >
                <div className="overflow-x-auto rounded-lg border border-[var(--gommo-border-subtle)]">
                    <table className="gommo-table w-full min-w-[56rem]">
                        <thead>
                            <tr>
                                <th>Dia</th>
                                <th>1º tempo — entrada</th>
                                <th>1º tempo — saída</th>
                                <th>2º tempo — entrada</th>
                                <th>2º tempo — encerramento</th>
                                <th className="is-right">Hora total</th>
                                <th>Intervalo principal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.days.map((day) => (
                                <tr key={day.dayOfWeek}>
                                    <td className="whitespace-nowrap font-medium">
                                        {WEEK_DAY_LABELS[day.dayOfWeek]}
                                    </td>
                                    <td>
                                        <InputHour
                                            value={day.period1Start ?? ""}
                                            onValueChange={(v) => updateDay(day.dayOfWeek, "period1Start", v)}
                                            wrapperClassName="!mb-0"
                                        />
                                    </td>
                                    <td>
                                        <InputHour
                                            value={day.period1End ?? ""}
                                            onValueChange={(v) => updateDay(day.dayOfWeek, "period1End", v)}
                                            wrapperClassName="!mb-0"
                                        />
                                    </td>
                                    <td>
                                        <InputHour
                                            value={day.period2Start ?? ""}
                                            onValueChange={(v) => updateDay(day.dayOfWeek, "period2Start", v)}
                                            wrapperClassName="!mb-0"
                                        />
                                    </td>
                                    <td>
                                        <InputHour
                                            value={day.period2End ?? ""}
                                            onValueChange={(v) => updateDay(day.dayOfWeek, "period2End", v)}
                                            wrapperClassName="!mb-0"
                                        />
                                    </td>
                                    <td className="is-right whitespace-nowrap tabular-nums text-base-content/70">
                                        {dayTotalHours(day) || "—"}
                                    </td>
                                    <td className="whitespace-nowrap text-base-content/70">
                                        {dayMainBreak(day) || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-sm text-base-content/60">Jornada semanal:</span>
                    <span className="rounded-md border border-[var(--gommo-border-subtle)] bg-base-200 px-3 py-1.5 text-sm font-semibold tabular-nums">
                        {weeklyTotalHours(form.days)}
                    </span>
                </div>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
