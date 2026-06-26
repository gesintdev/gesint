"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent,useEffect, useState } from "react";
import { toast } from "sonner";

import { attendancerecordKeys } from "@/modules/rh/person/attendance/attendance.query";
import type { AttendanceRecordCreateDto } from "@/modules/rh/person/attendance/dto/attendance-record.dto";
import { ATTENDANCE_CLIENT_MESSAGES } from "@/modules/rh/person/attendance/exceptions/attendance-record.messages";
import {
    attendancerecordToFormDto,
    emptyAttendanceRecordForm,
} from "@/modules/rh/person/attendance/lib/attendance-record.mapper";
import { attendancerecordService } from "@/modules/rh/person/attendance/services/attendance-record.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputDate,InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Ponto" }];

export function AttendanceRecordFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<AttendanceRecordCreateDto>(emptyAttendanceRecordForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: attendancerecordKeys.detail(editingId ?? ""),
        queryFn: () => attendancerecordService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyAttendanceRecordForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(attendancerecordToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: AttendanceRecordCreateDto) => {
            if (isEditing && editingId) return attendancerecordService.update(editingId, dto);
            return attendancerecordService.create(dto);
        },
        onSuccess: async () => {
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
    const update = <K extends keyof AttendanceRecordCreateDto>(field: K, value: AttendanceRecordCreateDto[K]) => {
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
            <FormSection id="cadastro" title="Ponto">
                <CollaboratorPickerField
                    value={form.collaboratorId ?? ""}
                    onValueChange={(v) => update("collaboratorId", v)}
                    required
                    wrapperClassName="sm:col-span-12"
                />
                <InputDate
                    label="Data de trabalho"
                    value={form.workDate ?? ""}
                    onValueChange={(v) => update("workDate", v)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Entrada"
                    value={form.clockIn ?? ""}
                    onValueChange={(v) => update("clockIn", v)}
                    hint="HH:mm"
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Saída"
                    value={form.clockOut ?? ""}
                    onValueChange={(v) => update("clockOut", v)}
                    hint="HH:mm"
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
