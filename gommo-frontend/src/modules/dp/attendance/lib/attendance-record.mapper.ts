import type {
    AttendanceOccurrenceType,
    AttendanceRecord,
    AttendanceRecordCreateDto,
} from "@/modules/dp/attendance/dto/attendance-record.dto";

export const ATTENDANCE_OCCURRENCE_TYPE_VALUES = [
    "NORMAL_WORK",
    "TIME_ADJUSTMENT",
    "MEDICAL_CERTIFICATE",
    "LEAVE_ABSENCE",
    "UNJUSTIFIED_ABSENCE",
    "LATE_ARRIVAL",
    "VACATION",
    "LICENSE",
] as const satisfies readonly AttendanceOccurrenceType[];

function normalizeTime(value?: string | null) {
    if (!value) return "";
    return value.slice(0, 5);
}

function minutesBetween(start?: string, end?: string) {
    if (!start || !end) return undefined;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if ([sh, sm, eh, em].some((part) => Number.isNaN(part))) return undefined;
    const diff = eh * 60 + em - (sh * 60 + sm);
    return diff >= 0 ? diff : undefined;
}

export function attendancerecordToFormDto(entity: AttendanceRecord): AttendanceRecordCreateDto {
    const clockIn = normalizeTime(entity.clockIn);
    const clockOut = normalizeTime(entity.clockOut);
    const breakStart = normalizeTime(entity.breakStart);
    const breakEnd = normalizeTime(entity.breakEnd);
    return {
        collaboratorId: entity.collaboratorId ?? "",
        workDate: entity.workDate?.slice(0, 10) ?? "",
        clockIn,
        clockOut,
        breakStart,
        breakEnd,
        breakMinutes: entity.breakMinutes ?? minutesBetween(breakStart, breakEnd),
        occurrenceType: entity.occurrenceType ?? "NORMAL_WORK",
        occurrenceOrigin: entity.occurrenceOrigin ?? "MANUAL",
        expectedHours: entity.expectedHours,
        workedHours: entity.workedHours,
        impactsHourBank: entity.impactsHourBank ?? true,
        impactsPayroll: entity.impactsPayroll ?? true,
        notes: entity.notes ?? "",
    };
}

export const emptyAttendanceRecordForm = (): AttendanceRecordCreateDto => ({
    collaboratorId: "",
    workDate: "",
    clockIn: "",
    clockOut: "",
    breakStart: "",
    breakEnd: "",
    breakMinutes: undefined,
    occurrenceType: "NORMAL_WORK",
    occurrenceOrigin: "MANUAL",
    expectedHours: undefined,
    workedHours: undefined,
    impactsHourBank: true,
    impactsPayroll: true,
    notes: "",
});
