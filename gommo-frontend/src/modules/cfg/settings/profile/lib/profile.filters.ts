import type {Profile} from "@/modules/cfg/settings/profile/dto/profile.dto";
import type {PageableResponseDto} from "@/shared/dto/pageable.dto";

function uniqueSorted(values: Array<string | null | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))].sort((a, b) =>
        a.localeCompare(b, "pt-BR", {sensitivity: "base"}),
    );
}

function fieldValue(row: Profile, field: string): string {
    const record = row as unknown as Record<string, unknown>;
    const raw = record[field];
    if (raw == null) return "";
    return String(raw);
}

function matchesContains(accepted: string[], value: string): boolean {
    const normalized = value.toLowerCase();
    return accepted.some((item) => normalized.includes(item.toLowerCase()));
}

export function matchesProfileFilters(row: Profile, filters: Record<string, string[]>): boolean {
    return Object.entries(filters).every(([field, accepted]) => {
        if (!accepted || accepted.length === 0) return true;
        if (field === "system" || field === "status") {
            return accepted.includes(fieldValue(row, field));
        }
        if (field === "code") {
            return matchesContains(accepted, row.code != null ? String(row.code) : "");
        }
        return matchesContains(accepted, fieldValue(row, field));
    });
}

export function buildProfileFilterOptions(rows: Profile[]): Record<string, string[]> {
    return {
        code: uniqueSorted(rows.map((row) => (row.code != null ? String(row.code) : undefined))),
        name: uniqueSorted(rows.map((row) => row.name)),
        system: uniqueSorted(rows.map((row) => row.system)),
        status: uniqueSorted(rows.map((row) => row.status).filter((status) => status && status !== "DELETED")),
        description: uniqueSorted(rows.map((row) => row.description)),
    };
}

export function paginateProfiles(
    rows: Profile[],
    page: number,
    size: number,
    filters: Record<string, string[]>,
): PageableResponseDto<Profile> {
    const filterOptions = buildProfileFilterOptions(rows);
    const filtered = rows.filter((row) => matchesProfileFilters(row, filters));
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
