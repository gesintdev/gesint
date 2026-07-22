import type {AttendancePresenceRow} from "@/modules/dp/attendance/dto/attendance-record.dto";
import type {PageableResponseDto} from "@/shared/dto/pageable.dto";

export type AttendancePresenceListingRow = AttendancePresenceRow & {
    presenceTags: string[];
    /** Entrada / Saída / Retorno / Fim expediente */
    schedule: string;
};

function uniqueSorted(values: Array<string | null | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))].sort((a, b) =>
        a.localeCompare(b, "pt-BR", {sensitivity: "base"}),
    );
}

/** Normaliza LocalTime da API (string, [h,m] ou objeto) para HH:mm. */
export function coerceTimeHm(value: unknown): string {
    if (value == null || value === "") return "";
    if (typeof value === "string") {
        const trimmed = value.trim();
        const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
        if (match) {
            return `${match[1].padStart(2, "0")}:${match[2]}`;
        }
        return trimmed;
    }
    if (Array.isArray(value) && value.length >= 2) {
        const hour = Number(value[0]);
        const minute = Number(value[1]);
        if (Number.isFinite(hour) && Number.isFinite(minute)) {
            return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        }
        return "";
    }
    if (typeof value === "object") {
        const record = value as {hour?: unknown; minute?: unknown};
        if (record.hour != null) {
            const hour = Number(record.hour);
            const minute = Number(record.minute ?? 0);
            if (Number.isFinite(hour) && Number.isFinite(minute)) {
                return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            }
        }
    }
    return "";
}

export function formatAttendanceSchedule(
    row: Pick<AttendancePresenceRow, "clockIn" | "breakStart" | "breakEnd" | "clockOut">,
): string {
    const slots = [row.clockIn, row.breakStart, row.breakEnd, row.clockOut].map((value) => {
        const time = coerceTimeHm(value);
        return time || "—";
    });
    if (slots.every((slot) => slot === "—")) return "—";
    return slots.join(" / ");
}

function fieldValue(row: AttendancePresenceListingRow, field: string): string {
    if (field === "presenceTags") {
        return (row.presenceTags ?? []).join(",");
    }
    if (field === "code") {
        return row.code != null ? String(row.code) : "";
    }
    if (field === "workedHours") {
        return row.workedHours == null ? "" : String(row.workedHours);
    }
    if (field === "schedule") {
        return row.schedule || formatAttendanceSchedule(row);
    }
    const record = row as unknown as Record<string, unknown>;
    const raw = record[field];
    if (raw == null) return "";
    return String(raw);
}

function matchesContains(accepted: string[], value: string): boolean {
    const normalized = value.toLowerCase();
    return accepted.some((item) => normalized.includes(item.toLowerCase()));
}

export function matchesPresenceFilters(
    row: AttendancePresenceListingRow,
    filters: Record<string, string[]>,
): boolean {
    return Object.entries(filters).every(([field, accepted]) => {
        if (!accepted || accepted.length === 0) return true;
        if (field === "presenceTags" || field === "occurrenceType" || field === "occurrenceOrigin") {
            if (field === "presenceTags") {
                return row.presenceTags.some((tag) => accepted.includes(tag));
            }
            if (field === "occurrenceOrigin") {
                return accepted.includes(row.occurrenceOrigin ?? "");
            }
            return accepted.includes(row.occurrenceType ?? "");
        }
        if (field === "workDate") {
            return accepted.includes(row.workDate?.slice(0, 10) ?? "");
        }
        return matchesContains(accepted, fieldValue(row, field));
    });
}

export function buildPresenceFilterOptions(
    rows: AttendancePresenceListingRow[],
): Record<string, string[]> {
    return {
        collaboratorName: uniqueSorted(rows.map((row) => row.collaboratorName)),
        workDate: uniqueSorted(rows.map((row) => row.workDate?.slice(0, 10))),
        occurrenceType: uniqueSorted(rows.map((row) => row.occurrenceType)),
        occurrenceOrigin: uniqueSorted(rows.map((row) => row.occurrenceOrigin)),
        presenceTags: uniqueSorted(rows.flatMap((row) => row.presenceTags)),
        code: uniqueSorted(rows.map((row) => (row.code != null ? String(row.code) : undefined))),
    };
}

export function paginatePresenceRows(
    rows: AttendancePresenceListingRow[],
    page: number,
    size: number,
    filters: Record<string, string[]>,
): PageableResponseDto<AttendancePresenceListingRow> {
    const filterOptions = buildPresenceFilterOptions(rows);
    const filtered = rows.filter((row) => matchesPresenceFilters(row, filters));
    const safeSize = Math.max(1, size);
    const safePage = Math.max(0, page);
    const from = Math.min(safePage * safeSize, filtered.length);
    const to = Math.min(from + safeSize, filtered.length);
    const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / safeSize);
    return {
        content: filtered.slice(from, to).map((row) => ({
            ...row,
            schedule: row.schedule || formatAttendanceSchedule(row),
        })),
        page: safePage,
        size: safeSize,
        totalElements: filtered.length,
        totalPages,
        filterOptions,
    };
}
