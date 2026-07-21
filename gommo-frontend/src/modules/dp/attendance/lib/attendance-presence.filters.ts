import type {AttendancePresenceRow} from "@/modules/dp/attendance/dto/attendance-record.dto";
import type {PageableResponseDto} from "@/shared/dto/pageable.dto";

export type AttendancePresenceListingRow = AttendancePresenceRow & {
    presenceTags: string[];
};

function uniqueSorted(values: Array<string | null | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))].sort((a, b) =>
        a.localeCompare(b, "pt-BR", {sensitivity: "base"}),
    );
}

function fieldValue(row: AttendancePresenceListingRow, field: string): string {
    if (field === "presenceTags") {
        return (row.presenceTags ?? []).join(",");
    }
    if (field === "code") {
        return row.code != null ? String(row.code) : "";
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
        if (field === "presenceTags" || field === "occurrenceType") {
            if (field === "presenceTags") {
                return row.presenceTags.some((tag) => accepted.includes(tag));
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
        presenceTags: uniqueSorted(rows.flatMap((row) => row.presenceTags)),
        clockIn: uniqueSorted(rows.map((row) => row.clockIn?.slice(0, 5))),
        clockOut: uniqueSorted(rows.map((row) => row.clockOut?.slice(0, 5))),
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
        content: filtered.slice(from, to),
        page: safePage,
        size: safeSize,
        totalElements: filtered.length,
        totalPages,
        filterOptions,
    };
}
