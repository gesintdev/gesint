import type {
    AttendanceCollaboratorSchedule,
    AttendanceRecord,
} from "@/modules/dp/attendance/dto/attendance-record.dto";
import {parseIsoToDate} from "@/shared/lib/input/date";

export type AttendancePunchTimes = {
    workDate?: string | null;
    clockIn?: string | null;
    breakStart?: string | null;
    breakEnd?: string | null;
    clockOut?: string | null;
    breakMinutes?: number | null;
};

const WEEKDAY_KEYS = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
] as const;

export type WeekDayKey = (typeof WEEKDAY_KEYS)[number];

/** Dia da semana (MONDAY…SUNDAY) a partir de data ISO `yyyy-MM-dd`. */
export function weekDayFromIsoDate(isoDate?: string | null): WeekDayKey | null {
    if (!isoDate) return null;
    const date = parseIsoToDate(isoDate.slice(0, 10));
    if (!date) return null;
    return WEEKDAY_KEYS[date.getDay()] ?? null;
}

function normalizeTime(value?: string | null): string {
    return value ? value.slice(0, 5) : "";
}

function minutesBetween(start?: string | null, end?: string | null): number {
    const from = normalizeTime(start);
    const to = normalizeTime(end);
    if (!from || !to) return 0;
    const [sh, sm] = from.split(":").map(Number);
    const [eh, em] = to.split(":").map(Number);
    if ([sh, sm, eh, em].some((part) => Number.isNaN(part))) return 0;
    const diff = eh * 60 + em - (sh * 60 + sm);
    return diff > 0 ? diff : 0;
}

function todayIsoLocal(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function nowTimeLocal(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/**
 * Horas trabalhadas a partir das batidas (espelha o backend).
 * Dia aberto de hoje sem saída conta até o horário atual; histórico incompleto = 0.
 */
export function calculateWorkedHoursFromPunches(times: AttendancePunchTimes): number {
    const clockIn = normalizeTime(times.clockIn);
    if (!clockIn) {
        if (
            times.clockOut == null &&
            times.breakStart == null &&
            times.breakEnd == null &&
            times.breakMinutes == null
        ) {
            return Number.NaN;
        }
        return 0;
    }

    const workDate = times.workDate?.slice(0, 10) ?? "";
    const clockOut = normalizeTime(times.clockOut);
    let end = clockOut;
    if (!end) {
        if (workDate && workDate === todayIsoLocal()) {
            end = nowTimeLocal();
        } else {
            return 0;
        }
    }

    const gross = minutesBetween(clockIn, end);
    const breakMinutes =
        times.breakStart && times.breakEnd
            ? minutesBetween(times.breakStart, times.breakEnd)
            : Math.max(0, times.breakMinutes ?? 0);
    const net = Math.max(0, gross - breakMinutes);
    return Math.round((net / 60) * 100) / 100;
}

export function formatAttendanceHours(value?: number | null): string {
    if (value == null || Number.isNaN(value)) return "—";
    return value.toFixed(2);
}

export function debitHoursValue(expected?: number | null, worked?: number | null): string {
    if (expected == null || Number.isNaN(expected)) return "—";
    const safeWorked = worked == null || Number.isNaN(worked) ? 0 : worked;
    return formatAttendanceHours(Math.max(0, expected - safeWorked));
}

export function creditHoursValue(expected?: number | null, worked?: number | null): string {
    if (expected == null || Number.isNaN(expected)) return "—";
    const safeWorked = worked == null || Number.isNaN(worked) ? 0 : worked;
    return formatAttendanceHours(Math.max(0, safeWorked - expected));
}

export function mergeAttendancePunches(
    row: AttendanceRecord,
    draftValues?: Partial<Record<"workDate" | "clockIn" | "breakStart" | "breakEnd" | "clockOut", string>>,
): AttendancePunchTimes {
    return {
        workDate:
            draftValues?.workDate !== undefined ? draftValues.workDate : row.workDate?.slice(0, 10),
        clockIn: draftValues?.clockIn !== undefined ? draftValues.clockIn : row.clockIn,
        breakStart: draftValues?.breakStart !== undefined ? draftValues.breakStart : row.breakStart,
        breakEnd: draftValues?.breakEnd !== undefined ? draftValues.breakEnd : row.breakEnd,
        clockOut: draftValues?.clockOut !== undefined ? draftValues.clockOut : row.clockOut,
        breakMinutes: row.breakMinutes,
    };
}

/**
 * Jornada esperada do dia pela escala da admissão (dia da semana).
 * Sem escala: usa fallbackDailyHours (carga textual). Folga na escala: 0.
 */
export function expectedHoursFromCollaboratorSchedule(
    schedule: AttendanceCollaboratorSchedule | null | undefined,
    isoDate?: string | null,
): number | undefined {
    if (!isoDate) return undefined;
    const weekDay = weekDayFromIsoDate(isoDate);
    if (!weekDay) return undefined;
    if (!schedule) return undefined;

    const days = schedule.days ?? [];
    if (days.length > 0) {
        const match = days.find((day) => day.dayOfWeek === weekDay);
        if (match) return match.expectedHours;
        return 0;
    }

    return schedule.fallbackDailyHours;
}
