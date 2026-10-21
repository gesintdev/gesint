"use client";

import {useQuery} from "@tanstack/react-query";
import clsx from "clsx";
import {useMemo, useState} from "react";

import {
    AttendanceAdjustmentRequestModal,
    buildAdjustmentPunches,
    type AttendanceAdjustmentTarget,
} from "@/modules/dp/attendance/components/AttendanceAdjustmentRequestModal";
import type {AttendanceRecord} from "@/modules/dp/attendance/dto/attendance-record.dto";
import {
    attendanceWeekRange,
    attendanceWeekRangeLabel,
    formatAttendanceHours,
    formatAttendancePunch,
    localDateKey,
    weekdayShortLabel,
} from "@/modules/dp/attendance/lib/attendance-clock.util";
import {attendancerecordService} from "@/modules/dp/attendance/services/attendance-record.service";

type AttendanceWeekHistoryPanelProps = {
    enabled: boolean;
};

function recordDateKey(workDate?: string) {
    if (!workDate) return "";
    return workDate.slice(0, 10);
}

export function AttendanceWeekHistoryPanel({enabled}: AttendanceWeekHistoryPanelProps) {
    const week = useMemo(() => attendanceWeekRange(new Date()), []);
    const todayKey = localDateKey(new Date());
    const [adjustmentTarget, setAdjustmentTarget] = useState<AttendanceAdjustmentTarget | null>(null);

    const recordsQuery = useQuery({
        queryKey: ["attendance", "mobile-records", week.from, week.to],
        queryFn: () => attendancerecordService.listMobileRecords(week.from, week.to),
        enabled,
        staleTime: 30_000,
        retry: false,
    });

    const recordsByDate = useMemo(() => {
        const map = new Map<string, AttendanceRecord>();
        for (const record of recordsQuery.data ?? []) {
            const key = recordDateKey(record.workDate);
            if (key) map.set(key, record);
        }
        return map;
    }, [recordsQuery.data]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-base-content/8 px-4 py-3">
                <h4 className="text-sm font-semibold text-base-content">Histórico da semana</h4>
                <p className="mt-0.5 text-xs text-base-content/50">
                    {attendanceWeekRangeLabel()} · clique para solicitar ajuste
                </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                {recordsQuery.isLoading ? (
                    <div className="grid gap-2">
                        {week.days.map((day) => (
                            <div
                                key={localDateKey(day)}
                                className="skeleton-shimmer h-14 w-full rounded-xl"
                            />
                        ))}
                    </div>
                ) : recordsQuery.isError ? (
                    <p className="px-1 py-6 text-center text-sm text-error">
                        Não foi possível carregar o histórico da semana.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {week.days.map((day) => {
                            const key = localDateKey(day);
                            const record = recordsByDate.get(key);
                            const isToday = key === todayKey;
                            const dayNumber = String(day.getDate()).padStart(2, "0");
                            return (
                                <li key={key}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAdjustmentTarget({
                                                workDate: key,
                                                record: record ?? null,
                                                initialPunches: buildAdjustmentPunches(record ?? null),
                                            })
                                        }
                                        className={clsx(
                                            "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                                            isToday
                                                ? "border-primary/30 bg-primary/5 hover:border-primary/45"
                                                : "border-base-content/8 bg-base-100 hover:border-base-content/16 hover:bg-base-200/40",
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-baseline gap-2">
                                                    <span
                                                        className={clsx(
                                                            "text-sm font-semibold tabular-nums",
                                                            isToday ? "text-primary" : "text-base-content",
                                                        )}
                                                    >
                                                        {weekdayShortLabel(day)} {dayNumber}
                                                    </span>
                                                    {isToday ? (
                                                        <span className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                                                            Hoje
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1 text-[11px] tabular-nums text-base-content/55">
                                                    {[
                                                        formatAttendancePunch(record?.clockIn),
                                                        formatAttendancePunch(record?.breakStart),
                                                        formatAttendancePunch(record?.breakEnd),
                                                        formatAttendancePunch(record?.clockOut),
                                                    ].join(" · ")}
                                                </p>
                                            </div>
                                            <span
                                                className={clsx(
                                                    "shrink-0 text-xs font-medium tabular-nums",
                                                    record?.workedHours != null
                                                        ? "text-base-content/70"
                                                        : "text-base-content/35",
                                                )}
                                            >
                                                {formatAttendanceHours(record?.workedHours)}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <AttendanceAdjustmentRequestModal
                open={adjustmentTarget != null}
                target={adjustmentTarget}
                onClose={() => setAdjustmentTarget(null)}
            />
        </div>
    );
}
