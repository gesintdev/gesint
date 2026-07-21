import type {
    AttendanceOccurrenceType,
    AttendanceRecord,
    AttendanceRecordCreateDto,
} from "@/modules/dp/attendance/dto/attendance-record.dto";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

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

export const ATTENDANCE_OCCURRENCE_TYPE_ITEMS: SelectItem[] = [
    {value: "NORMAL_WORK", label: "Trabalho normal"},
    {value: "TIME_ADJUSTMENT", label: "Ajuste de ponto"},
    {value: "LATE_ARRIVAL", label: "Atraso"},
    {value: "UNJUSTIFIED_ABSENCE", label: "Falta injustificada"},
    {value: "MEDICAL_CERTIFICATE", label: "Atestado médico"},
    {value: "LEAVE_ABSENCE", label: "Afastamento"},
    {value: "VACATION", label: "Férias"},
    {value: "LICENSE", label: "Licença"},
];

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

export const ATTENDANCE_PREFILL_STORAGE_KEY = "gommo-attendance-record-prefill";
export const ATTENDANCE_PREFILL_EVENT = "gommo-attendance-record-prefill";

export type AttendanceRecordPrefill = {
    collaboratorId?: string;
    workDate?: string;
};

/** Mantém o prefill em memória para sobreviver ao remount do React Strict Mode. */
let stickyPrefill: AttendanceRecordPrefill | null = null;

export function writeAttendancePrefill(prefill: AttendanceRecordPrefill) {
    stickyPrefill = prefill;
    window.sessionStorage.setItem(ATTENDANCE_PREFILL_STORAGE_KEY, JSON.stringify(prefill));
    window.dispatchEvent(new CustomEvent(ATTENDANCE_PREFILL_EVENT, {detail: prefill}));
}

export function peekAttendancePrefill(): AttendanceRecordPrefill | null {
    if (stickyPrefill) return stickyPrefill;
    const raw = window.sessionStorage.getItem(ATTENDANCE_PREFILL_STORAGE_KEY);
    if (!raw) return null;
    try {
        stickyPrefill = JSON.parse(raw) as AttendanceRecordPrefill;
        return stickyPrefill;
    } catch {
        return null;
    }
}

export function clearAttendancePrefill() {
    stickyPrefill = null;
    window.sessionStorage.removeItem(ATTENDANCE_PREFILL_STORAGE_KEY);
}

export function applyAttendancePrefill(
    base: AttendanceRecordCreateDto,
    prefill: AttendanceRecordPrefill | null,
): AttendanceRecordCreateDto {
    if (!prefill) return base;
    return {
        ...base,
        collaboratorId: prefill.collaboratorId?.trim() || base.collaboratorId,
        workDate: prefill.workDate?.slice(0, 10) || base.workDate,
    };
}

export function withDerivedBreakMinutes(form: AttendanceRecordCreateDto): AttendanceRecordCreateDto {
    const breakMinutes = minutesBetween(form.breakStart, form.breakEnd);
    return {
        ...form,
        breakMinutes: breakMinutes ?? form.breakMinutes,
    };
}
