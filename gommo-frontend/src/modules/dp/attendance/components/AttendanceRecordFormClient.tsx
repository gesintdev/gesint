"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { attendancerecordKeys } from "@/modules/dp/attendance/attendance.query";
import type { AttendanceRecordCreateDto } from "@/modules/dp/attendance/dto/attendance-record.dto";
import { ATTENDANCE_CLIENT_MESSAGES } from "@/modules/dp/attendance/exceptions/attendance-record.messages";
import {
    ATTENDANCE_OCCURRENCE_TYPE_ITEMS,
    ATTENDANCE_PREFILL_EVENT,
    applyAttendancePrefill,
    attendancerecordToFormDto,
    clearAttendancePrefill,
    emptyAttendanceRecordForm,
    peekAttendancePrefill,
    withDerivedBreakMinutes,
    type AttendanceRecordPrefill,
} from "@/modules/dp/attendance/lib/attendance-record.mapper";
import { attendanceRecordFormSchema } from "@/modules/dp/attendance/schemas/attendance-record.schema";
import { attendancerecordService } from "@/modules/dp/attendance/services/attendance-record.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { CRUD_TAB_FORM, useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputDate, InputHour, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { mapZodFieldErrors } from "@/shared/lib/zod-field-errors";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "identificacao", label: "Identificação" },
    { id: "horarios", label: "Horários" },
    { id: "classificacao", label: "Classificação" },
];

type AttendanceFormField = keyof AttendanceRecordCreateDto;

function blankToUndefined(value?: string) {
    return value?.trim() ? value.trim() : undefined;
}

function mergePrefill(prefill: AttendanceRecordPrefill | null) {
    return applyAttendancePrefill(emptyAttendanceRecordForm(), prefill);
}

export function AttendanceRecordFormClient() {
    const { activeTab, editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AttendanceRecordCreateDto>(() => mergePrefill(peekAttendancePrefill()));
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<AttendanceFormField, string>>>({});
    const detailQuery = useQuery({
        queryKey: attendancerecordKeys.detail(editingId ?? ""),
        queryFn: () => attendancerecordService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (isEditing) {
            if (detailQuery.data) {
                setForm(attendancerecordToFormDto(detailQuery.data));
                setError(null);
                setFieldErrors({});
            }
            return;
        }

        const apply = (prefill: AttendanceRecordPrefill | null) => {
            if (!prefill?.collaboratorId && !prefill?.workDate) return;
            setForm(mergePrefill(prefill));
            setError(null);
            setFieldErrors({});
        };

        if (activeTab === CRUD_TAB_FORM) {
            apply(peekAttendancePrefill());
            // Aguarda o ciclo do Strict Mode antes de limpar o prefill.
            const timeoutId = window.setTimeout(() => clearAttendancePrefill(), 0);
            const onPrefill = (event: Event) => {
                const detail = (event as CustomEvent<AttendanceRecordPrefill>).detail;
                apply(detail ?? peekAttendancePrefill());
            };
            window.addEventListener(ATTENDANCE_PREFILL_EVENT, onPrefill);
            return () => {
                window.clearTimeout(timeoutId);
                window.removeEventListener(ATTENDANCE_PREFILL_EVENT, onPrefill);
            };
        }

        return undefined;
    }, [activeTab, isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: AttendanceRecordCreateDto) => {
            if (isEditing && editingId) return attendancerecordService.update(editingId, dto);
            return attendancerecordService.create(dto);
        },
        onSuccess: async () => {
            clearAttendancePrefill();
            await queryClient.invalidateQueries({ queryKey: attendancerecordKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: attendancerecordKeys.detail(editingId) });
            toast.success(isEditing ? "Registro de ponto atualizado" : "Registro de ponto cadastrado");
            setForm(emptyAttendanceRecordForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends AttendanceFormField>(field: K, value: AttendanceRecordCreateDto[K]) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "breakStart" || field === "breakEnd") {
                return withDerivedBreakMinutes(next);
            }
            return next;
        });
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const payload = withDerivedBreakMinutes({
            ...form,
            clockIn: blankToUndefined(form.clockIn),
            clockOut: blankToUndefined(form.clockOut),
            breakStart: blankToUndefined(form.breakStart),
            breakEnd: blankToUndefined(form.breakEnd),
            notes: blankToUndefined(form.notes),
            occurrenceOrigin: form.occurrenceOrigin ?? "MANUAL",
        });
        const parsed = attendanceRecordFormSchema.safeParse(payload);
        if (!parsed.success) {
            setFieldErrors(mapZodFieldErrors<AttendanceFormField>(parsed.error));
            setError("Verifique os campos destacados.");
            return;
        }
        setFieldErrors({});
        saveMutation.mutate(parsed.data);
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
                        ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED,
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
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            clearAttendancePrefill();
                            goToList();
                        }}
                    >
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
            <FormSection id="identificacao" title="Identificação">
                <CollaboratorPickerField
                    value={form.collaboratorId ?? ""}
                    onValueChange={(v) => update("collaboratorId", v)}
                    required
                    error={fieldErrors.collaboratorId}
                    wrapperClassName="sm:col-span-12"
                />
                <InputDate
                    label="Data de trabalho"
                    value={form.workDate ?? ""}
                    onValueChange={(v) => update("workDate", v)}
                    required
                    error={fieldErrors.workDate}
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Tipo de ocorrência"
                    value={form.occurrenceType ?? "NORMAL_WORK"}
                    onValueChange={(v) => update("occurrenceType", v as AttendanceRecordCreateDto["occurrenceType"])}
                    items={ATTENDANCE_OCCURRENCE_TYPE_ITEMS}
                    required
                    error={fieldErrors.occurrenceType}
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>

            <FormSection id="horarios" title="Horários">
                <InputHour
                    label="Entrada"
                    value={form.clockIn ?? ""}
                    onValueChange={(v) => update("clockIn", v)}
                    hint="Digite HH.MM ou selecione"
                    error={fieldErrors.clockIn}
                    wrapperClassName="sm:col-span-3"
                />
                <InputHour
                    label="Saída almoço"
                    value={form.breakStart ?? ""}
                    onValueChange={(v) => update("breakStart", v)}
                    hint="Digite HH.MM ou selecione"
                    error={fieldErrors.breakStart}
                    wrapperClassName="sm:col-span-3"
                />
                <InputHour
                    label="Retorno almoço"
                    value={form.breakEnd ?? ""}
                    onValueChange={(v) => update("breakEnd", v)}
                    hint="Digite HH.MM ou selecione"
                    error={fieldErrors.breakEnd}
                    wrapperClassName="sm:col-span-3"
                />
                <InputHour
                    label="Saída"
                    value={form.clockOut ?? ""}
                    onValueChange={(v) => update("clockOut", v)}
                    hint="Digite HH.MM ou selecione"
                    error={fieldErrors.clockOut}
                    wrapperClassName="sm:col-span-3"
                />
                <InputString
                    label="Intervalo (minutos)"
                    value={form.breakMinutes != null ? String(form.breakMinutes) : ""}
                    onValueChange={(v) =>
                        update("breakMinutes", v.trim() ? Number.parseInt(v, 10) || 0 : undefined)
                    }
                    hint="Calculado automaticamente quando há saída e retorno de almoço"
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Observações"
                    value={form.notes ?? ""}
                    onValueChange={(v) => update("notes", v)}
                    error={fieldErrors.notes}
                    wrapperClassName="sm:col-span-8"
                />
            </FormSection>

            <FormSection id="classificacao" title="Classificação">
                <label className="flex items-start gap-3 rounded-xl border border-base-300 p-4 sm:col-span-6">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary mt-0.5"
                        checked={Boolean(form.impactsHourBank)}
                        onChange={(event) => update("impactsHourBank", event.target.checked)}
                    />
                    <span>
                        <span className="block text-sm font-semibold text-base-content">Impacta banco de horas</span>
                        <span className="mt-1 block text-sm text-base-content/55">
                            Considera este dia no cálculo de crédito ou débito de horas.
                        </span>
                    </span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border border-base-300 p-4 sm:col-span-6">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary mt-0.5"
                        checked={Boolean(form.impactsPayroll)}
                        onChange={(event) => update("impactsPayroll", event.target.checked)}
                    />
                    <span>
                        <span className="block text-sm font-semibold text-base-content">Impacta folha</span>
                        <span className="mt-1 block text-sm text-base-content/55">
                            Mantém o registro elegível para processamento na folha de pagamento.
                        </span>
                    </span>
                </label>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
