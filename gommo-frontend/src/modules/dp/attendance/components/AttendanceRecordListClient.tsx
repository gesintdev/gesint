"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { attendancerecordKeys } from "@/modules/dp/attendance/attendance.query";
import { ATTENDANCE_TABLE_COLUMNS } from "@/modules/dp/attendance/config/attendance-record.table-columns";
import type { AttendancePresenceRow } from "@/modules/dp/attendance/dto/attendance-record.dto";
import { ATTENDANCE_CLIENT_MESSAGES } from "@/modules/dp/attendance/exceptions/attendance-record.messages";
import { writeAttendancePrefill } from "@/modules/dp/attendance/lib/attendance-record.mapper";
import { attendancerecordService } from "@/modules/dp/attendance/services/attendance-record.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { InputDate } from "@/shared/components/ui/input";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

type PresencePreset = "TODAY" | "TODAY_YESTERDAY" | "WEEK" | "CUSTOM";

type PresenceListingRow = AttendancePresenceRow & { presenceTags: string[] };

const PRESETS: Array<{ value: PresencePreset; label: string }> = [
    { value: "TODAY", label: "Hoje" },
    { value: "TODAY_YESTERDAY", label: "Hoje e ontem" },
    { value: "WEEK", label: "Semana" },
];

function todayIso() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function shiftIso(isoDate: string, days: number) {
    const date = new Date(`${isoDate}T12:00:00`);
    date.setDate(date.getDate() + days);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function resolvePeriod(preset: PresencePreset, customDate: string): { from: string; to: string } {
    const today = todayIso();
    if (preset === "CUSTOM" && customDate) {
        return { from: customDate, to: customDate };
    }
    if (preset === "TODAY_YESTERDAY") {
        return { from: shiftIso(today, -1), to: today };
    }
    if (preset === "WEEK") {
        return { from: shiftIso(today, -6), to: today };
    }
    return { from: today, to: today };
}

function presenceTags(row: AttendancePresenceRow): string[] {
    const tags: string[] = [];
    if (row.present) tags.push("PRESENT");
    if (row.inVacation) tags.push("IN_VACATION");
    if (row.onLeaveActive) tags.push("ON_LEAVE");
    if (!row.present && !row.inVacation && !row.onLeaveActive) tags.push("ABSENT");
    return tags;
}

function isRealRecord(row: AttendancePresenceRow) {
    return row.hasRecord && !row.id.startsWith("absent:");
}

export function AttendanceRecordListClient() {
    const { startEdit, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [preset, setPreset] = useState<PresencePreset>("TODAY");
    const [customDate, setCustomDate] = useState(todayIso());
    const period = useMemo(() => resolvePeriod(preset, customDate), [preset, customDate]);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => attendancerecordService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: attendancerecordKeys.all });
            toast.success("Registro de ponto excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED }),
    });

    const handleDelete = async (row: AttendancePresenceRow) => {
        if (!isRealRecord(row)) return;
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    const openManualCreate = (row: AttendancePresenceRow) => {
        writeAttendancePrefill({
            collaboratorId: row.collaboratorId,
            workDate: row.workDate?.slice(0, 10),
        });
        startCreate();
    };

    const handleRowActivate = (row: AttendancePresenceRow) => {
        if (isRealRecord(row)) {
            startEdit(row.id, row);
            return;
        }
        openManualCreate(row);
    };

    return (
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-2">
            <div className="flex flex-wrap items-end gap-3 px-1 pt-3">
                <div
                    className="flex h-[var(--gommo-control-h)] flex-wrap items-center gap-2"
                    role="radiogroup"
                    aria-label="Filtrar período de ponto"
                >
                    {PRESETS.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            role="radio"
                            aria-checked={preset === filter.value}
                            onClick={() => setPreset(filter.value)}
                            className={clsx(
                                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                                preset === filter.value
                                    ? "bg-primary/12 text-primary"
                                    : "bg-base-content/5 text-base-content/60 hover:bg-base-content/8",
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <div className="w-[11rem]">
                    <InputDate
                        label="Data"
                        value={customDate}
                        onValueChange={(value) => {
                            setCustomDate(value);
                            setPreset("CUSTOM");
                        }}
                    />
                </div>
            </div>

            <QueryTablePanel<PresenceListingRow>
                queryKey={[...attendancerecordKeys.all, "presence", period.from, period.to]}
                request={async () => {
                    const rows = await attendancerecordService.listPresence(period.from, period.to);
                    return rows.map((row) => ({ ...row, presenceTags: presenceTags(row) }));
                }}
                columns={ATTENDANCE_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhum colaborador encontrado para o período."
                onRowActivate={handleRowActivate}
                renderActions={(row) =>
                    isRealRecord(row) ? (
                        <CrudTableActions
                            row={row}
                            onEdit={() => startEdit(row.id, row)}
                            onDelete={() => void handleDelete(row)}
                            deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                        />
                    ) : (
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Lançar ponto"
                            title="Lançar ponto"
                            leftIcon={<Plus className="size-3.5" />}
                            onClick={(event) => {
                                event.stopPropagation();
                                openManualCreate(row);
                            }}
                        />
                    )
                }
            />
        </div>
    );
}
