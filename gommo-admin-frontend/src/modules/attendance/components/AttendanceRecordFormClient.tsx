"use client";
import { useEffect, useState, type SubmitEvent } from "react";
import {
    emptyAttendanceRecordForm,
    attendancerecordToFormDto,
} from "@/modules/attendance/lib/attendance-record.mapper";
import { InputString, InputDate } from "@/shared/components/ui/input/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attendancerecordKeys } from "@/modules/attendance/attendance.query";
import type { AttendanceRecordCreateDto } from "@/modules/attendance/dto/attendance-record.dto";
import { ATTENDANCE_CLIENT_MESSAGES } from "@/modules/attendance/exceptions/attendance-record.messages";
import { attendancerecordService } from "@/modules/attendance/services/attendance-record.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

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
            toast.success(isEditing ? "Registro de ponto atualizado(a)" : "Registro de ponto cadastrado(a)");
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
            <div className="gommo-crud-panel-inset grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="gommo-crud-panel-inset">
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
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <p className="text-sm font-semibold text-base-content">
                        {isEditing ? "Editar registro de ponto" : "Novo(a) registro de ponto"}
                    </p>
                </div>
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
                <InputString
                    label="Collaborator  I D"
                    value={form.collaboratorId ?? ""}
                    onValueChange={(v) => update("collaboratorId", v)}
                    required
                />
                <InputDate
                    label="Work Date"
                    value={form.workDate ?? ""}
                    onValueChange={(v) => update("workDate", v)}
                    required
                />
                <InputString
                    label="Clock In"
                    value={form.clockIn ?? ""}
                    onValueChange={(v) => update("clockIn", v)}
                    hint="HH:mm"
                />
                <InputString
                    label="Clock Out"
                    value={form.clockOut ?? ""}
                    onValueChange={(v) => update("clockOut", v)}
                    hint="HH:mm"
                />
                {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
            </div>
        </CrudFormShell>
    );
}
