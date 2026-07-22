import type {AttendanceRecord} from "@/modules/dp/attendance/dto/attendance-record.dto";

const PUNCH_LABELS = ["Entrada", "Saída para almoço", "Volta do almoço", "Saída"] as const;
const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export function createClientRequestId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatLiveClock(date = new Date()) {
    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function formatLiveDate(date = new Date()) {
    const formatted = date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function nextPunchIndex(record?: AttendanceRecord | null) {
    if (!record?.clockIn) return 0;
    if (!record.breakStart) return 1;
    if (!record.breakEnd) return 2;
    if (!record.clockOut) return 3;
    return 4;
}

export function nextPunchLabel(record?: AttendanceRecord | null) {
    const index = nextPunchIndex(record);
    return index >= PUNCH_LABELS.length ? "Jornada concluída" : PUNCH_LABELS[index];
}

export function isJourneyComplete(record?: AttendanceRecord | null) {
    return nextPunchIndex(record) >= PUNCH_LABELS.length;
}

function startOfLocalDay(date: Date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function addLocalDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function pad2(value: number) {
    return String(value).padStart(2, "0");
}

/** Segunda-feira da semana de trabalho que contém a data. */
export function startOfAttendanceWeek(date: Date) {
    const day = startOfLocalDay(date);
    const weekday = day.getDay();
    const offset = weekday === 0 ? -6 : 1 - weekday;
    return addLocalDays(day, offset);
}

export function localDateKey(date: Date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Segunda a domingo da semana corrente, limitado até a data âncora (sem dias futuros). */
export function attendanceWeekDays(anchor = new Date()) {
    const monday = startOfAttendanceWeek(anchor);
    const today = startOfLocalDay(anchor);
    return Array.from({length: 7}, (_, index) => addLocalDays(monday, index)).filter(
        (day) => day.getTime() <= today.getTime(),
    );
}

export function attendanceWeekRange(anchor = new Date()) {
    const days = attendanceWeekDays(anchor);
    const from = localDateKey(days[0] ?? startOfAttendanceWeek(anchor));
    const to = localDateKey(days[days.length - 1] ?? startOfLocalDay(anchor));
    return {from, to, days};
}

export function attendanceWeekRangeLabel(anchor = new Date()) {
    const days = attendanceWeekDays(anchor);
    if (days.length === 0) return "";
    const first = days[0]!;
    const last = days[days.length - 1]!;
    const firstLabel = first.toLocaleDateString("pt-BR", {day: "2-digit", month: "short"});
    if (first.getTime() === last.getTime()) {
        return firstLabel;
    }
    const lastLabel = last.toLocaleDateString("pt-BR", {day: "2-digit", month: "short"});
    return `${firstLabel} - ${lastLabel}`;
}

export function weekdayShortLabel(date: Date) {
    return WEEKDAY_SHORT[date.getDay()] ?? "";
}

export function formatAttendancePunch(value?: string | number[] | null) {
    if (value == null || value === "") return "—";
    if (Array.isArray(value)) {
        const hour = Number(value[0] ?? 0);
        const minute = Number(value[1] ?? 0);
        if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "—";
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
    const raw = String(value).trim();
    if (!raw) return "—";
    const normalized = raw.includes("T") ? raw.slice(11, 16) : raw.slice(0, 5).replace(".", ":");
    const match = normalized.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return "—";
    return `${match[1]!.padStart(2, "0")}:${match[2]}`;
}

export function formatAttendanceHours(value?: number | null) {
    if (value == null || Number.isNaN(value)) return "—";
    return `${value.toFixed(2).replace(".", ",")}h`;
}
