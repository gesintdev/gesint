import type {AttendanceRecord} from "@/modules/dp/attendance/dto/attendance-record.dto";

const PUNCH_LABELS = ["Entrada", "Saída para almoço", "Volta do almoço", "Saída"] as const;

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
