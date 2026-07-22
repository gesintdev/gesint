"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {Eye} from "lucide-react";
import {useMemo, useState} from "react";
import {toast} from "sonner";

import {attendancerecordKeys} from "@/modules/dp/attendance/attendance.query";
import {ATTENDANCE_TABLE_COLUMNS} from "@/modules/dp/attendance/config/attendance-record.table-columns";
import type {AttendancePresenceRow} from "@/modules/dp/attendance/dto/attendance-record.dto";
import {ATTENDANCE_CLIENT_MESSAGES} from "@/modules/dp/attendance/exceptions/attendance-record.messages";
import {writeAttendanceCollaboratorFocus} from "@/modules/dp/attendance/lib/attendance-collaborator-focus";
import {
    type AttendancePresenceListingRow,
    coerceTimeHm,
    formatAttendanceSchedule,
    paginatePresenceRows,
} from "@/modules/dp/attendance/lib/attendance-presence.filters";
import {attendancerecordService} from "@/modules/dp/attendance/services/attendance-record.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {QueryPagedTablePanel} from "@/shared/components/data/DataPanel";
import {InputDate} from "@/shared/components/ui/input/InputDate";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

type PresencePreset = "TODAY" | "TODAY_YESTERDAY" | "WEEK" | "CUSTOM";

const PRESETS: Array<{ value: PresencePreset; label: string }> = [
    {value: "TODAY", label: "Hoje"},
    {value: "TODAY_YESTERDAY", label: "Hoje e ontem"},
    {value: "WEEK", label: "Semana"},
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
        return {from: customDate, to: customDate};
    }
    if (preset === "TODAY_YESTERDAY") {
        return {from: shiftIso(today, -1), to: today};
    }
    if (preset === "WEEK") {
        return {from: shiftIso(today, -6), to: today};
    }
    return {from: today, to: today};
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

function toListingRow(row: AttendancePresenceRow): AttendancePresenceListingRow {
    const clockIn = coerceTimeHm(row.clockIn) || undefined;
    const breakStart = coerceTimeHm(row.breakStart) || undefined;
    const breakEnd = coerceTimeHm(row.breakEnd) || undefined;
    const clockOut = coerceTimeHm(row.clockOut) || undefined;
    const normalized = {
        ...row,
        clockIn,
        breakStart,
        breakEnd,
        clockOut,
    };
    return {
        ...normalized,
        presenceTags: presenceTags(row),
        schedule: formatAttendanceSchedule(normalized),
    };
}

export function AttendanceRecordListClient() {
    const {startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const [preset, setPreset] = useState<PresencePreset>("TODAY");
    const [customDate, setCustomDate] = useState(todayIso());
    const period = useMemo(() => resolvePeriod(preset, customDate), [preset, customDate]);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => attendancerecordService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: attendancerecordKeys.all});
            toast.success("Registro de ponto excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED}),
    });

    const handleDelete = async (row: AttendancePresenceRow) => {
        if (!isRealRecord(row)) return;
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    const openCollaboratorHistory = (row: AttendancePresenceRow) => {
        writeAttendanceCollaboratorFocus({
            collaboratorId: row.collaboratorId,
            collaboratorName: row.collaboratorName,
        });
        startCreate();
    };

    return (
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-2">
            <div className="flex flex-wrap items-end gap-3 px-1 pt-3">
                <div
                    className="flex h-(--gommo-control-h) flex-wrap items-center gap-2"
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
                <div className="w-44">
                    <InputDate
                        value={customDate}
                        onValueChange={(value) => {
                            setCustomDate(value);
                            setPreset("CUSTOM");
                        }}
                    />
                </div>
            </div>

            <QueryPagedTablePanel<AttendancePresenceListingRow>
                key={`${period.from}-${period.to}`}
                queryKey={[...attendancerecordKeys.all, "presence", "schedule", period.from, period.to]}
                paginationMode="load-more"
                request={async (page, size, filters) => {
                    const rows = await attendancerecordService.listPresence(period.from, period.to);
                    const enriched = rows.map(toListingRow);
                    return paginatePresenceRows(enriched, page, size, filters);
                }}
                columns={ATTENDANCE_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhum colaborador encontrado para o período."
                onRowActivate={openCollaboratorHistory}
                renderActions={(row) =>
                    isRealRecord(row) ? (
                        <CrudTableActions
                            row={row}
                            onEdit={() => openCollaboratorHistory(row)}
                            onDelete={() => void handleDelete(row)}
                            deleteLoading={
                                deleteMutation.isPending && deleteMutation.variables === row.id
                            }
                        />
                    ) : (
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Abrir histórico do colaborador"
                            title="Abrir histórico"
                            leftIcon={<Eye className="size-3.5"/>}
                            onClick={(event) => {
                                event.stopPropagation();
                                openCollaboratorHistory(row);
                            }}
                        />
                    )
                }
            />
        </div>
    );
}
