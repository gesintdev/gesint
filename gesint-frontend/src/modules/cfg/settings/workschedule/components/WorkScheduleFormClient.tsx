"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type FormEvent, useEffect, useState} from "react";
import {toast} from "sonner";

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
import {workScheduleService} from "@/modules/cfg/settings/workschedule/services/work-schedule.service";
import {workScheduleKeys} from "@/modules/cfg/settings/workschedule/workschedule.query";
import { CrudFormFooterActions } from "@/shared/components/crud/CrudFormFooterActions";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useTrackedCrudFormDirty} from "@/shared/components/crud/useTrackedCrudFormDirty";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {InputHour, InputString} from "@/shared/components/ui/input/index";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import {ExceptionCapture} from "@/shared/exceptions";

type DayTimeField = keyof Pick<
    WorkScheduleDayCreateDto,
    "period1Start" | "period1End" | "period2Start" | "period2End"
>;

export function WorkScheduleFormClient() {
    const {editingId, isEditing, goToList, showSavedRecord} = useCrudScreen();
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
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: workScheduleToFormDto,
        getEmptyForm: () => emptyWorkScheduleForm(),
    });

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
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({queryKey: workScheduleKeys.all});
            await queryClient.invalidateQueries({queryKey: workScheduleKeys.active});
            if (editingId) {
                await queryClient.invalidateQueries({queryKey: workScheduleKeys.detail(editingId)});
            }
            toast.success(isEditing ? "Escala atualizada" : "Escala cadastrada");
            void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar a escala.",
            });
            setError(ex.displayMessage);
        },
    });

    const applyTwelveThirtySix = (start: string, end: string) => {
        setForm((prev) => ({
            ...prev,
            name: prev.name.trim() ? prev.name : "12x36",
            days: prev.days.map((day) => ({
                ...day,
                period1Start: start,
                period1End: end,
                period2Start: "",
                period2End: "",
            })),
        }));
    };

    const updateDay = (dayOfWeek: string, field: DayTimeField, value: string) => {
        setForm((prev) => ({
            ...prev,
            days: prev.days.map((day) =>
                day.dayOfWeek === dayOfWeek ? {...day, [field]: value} : day,
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
            <SkeletonStack count={4} padded />
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
            header={<CrudFormFooterActions isSubmitting={saveMutation.isPending} />}
        >
            <FormSection id="dados" title="Dados da escala" description="Identificação da jornada.">
                <InputString
                    label="Nome"
                    value={form.name}
                    onValueChange={(v) => setForm((prev) => ({...prev, name: v}))}
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Descrição"
                    value={form.description ?? ""}
                    onValueChange={(v) => setForm((prev) => ({...prev, description: v}))}
                    wrapperClassName="sm:col-span-8"
                />
            </FormSection>

            <FormSection
                id="quadro"
                title="Quadro de horários"
                description="Um período de 12 horas vale para a escala 12x36, inclusive com saída no dia seguinte (19:00–07:00). Sábado e domingo entram no quadro. Deixe em branco os dias de folga."
                bodyClassName="!block"
            >
                <div className="mb-3 flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyTwelveThirtySix("07:00", "19:00")}
                    >
                        12x36 diurna (07:00–19:00)
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyTwelveThirtySix("19:00", "07:00")}
                    >
                        12x36 noturna (19:00–07:00)
                    </Button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-[var(--gesint-border-subtle)]">
                    <table className="gesint-table w-full min-w-[36rem] sm:min-w-[48rem] lg:min-w-[56rem]">
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
                    <span
                        className="rounded-md border border-[var(--gesint-border-subtle)] bg-base-200 px-3 py-1.5 text-sm font-semibold tabular-nums">
                        {weeklyTotalHours(form.days)}
                    </span>
                </div>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
