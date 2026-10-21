import type {PageableResponseDto} from "@/shared/dto/pageable.dto";
import {sortRowsByCreatedAtDesc} from "@/shared/lib/table/sort-rows-by-created-at";

function uniqueSorted(values: Array<string | null | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))].sort((a, b) =>
        a.localeCompare(b, "pt-BR", {sensitivity: "base"}),
    );
}

function fieldValue(row: object, field: string): string {
    const raw = (row as Record<string, unknown>)[field];
    if (raw == null) return "";
    return String(raw);
}

function matchesContains(accepted: string[], value: string): boolean {
    const normalized = value.toLowerCase();
    return accepted.some((item) => normalized.includes(item.toLowerCase()));
}

function matchesFilters(row: object, filters: Record<string, string[]>): boolean {
    return Object.entries(filters).every(([field, accepted]) => {
        if (!accepted || accepted.length === 0) return true;
        if (field === "status" || field === "system") {
            return accepted.includes(fieldValue(row, field));
        }
        if (field === "code") {
            return matchesContains(accepted, fieldValue(row, field));
        }
        return matchesContains(accepted, fieldValue(row, field));
    });
}

function buildFilterOptions(rows: object[]): Record<string, string[]> {
    const options: Record<string, string[]> = {
        status: ["ACTIVE", "INACTIVE"],
    };
    if (rows.length === 0) return options;
    const sample = rows[0] as Record<string, unknown>;
    for (const key of Object.keys(sample)) {
        if (key === "status" || key === "id") continue;
        options[key] = uniqueSorted(rows.map((row) => fieldValue(row, key)));
    }
    return options;
}

/** Paginação client-side com filtros de coluna (padrão Profile / QueryPagedTablePanel). */
export function paginateCatalogRows<T extends object>(
    rows: T[],
    page: number,
    size: number,
    filters: Record<string, string[]>,
): PageableResponseDto<T> {
    const sorted = sortRowsByCreatedAtDesc(rows);
    const filterOptions = buildFilterOptions(sorted);
    const filtered = sorted.filter((row) => matchesFilters(row, filters));
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

/** Carrega ACTIVE + INACTIVE para listagens com filtro de coluna Status. */
export async function loadActiveAndInactiveRows<T>(
    getAll: (options: {status: "ACTIVE" | "INACTIVE"}) => Promise<T[]>,
): Promise<T[]> {
    const [active, inactive] = await Promise.all([
        getAll({status: "ACTIVE"}),
        getAll({status: "INACTIVE"}),
    ]);
    return [...active, ...inactive];
}

export const CATALOG_STATUS_INITIAL_FILTERS: Record<string, string[]> = {status: ["ACTIVE"]};

/** @deprecated Use {@link CATALOG_STATUS_INITIAL_FILTERS} */
export const CATALOG_STATUS_BASE_FILTERS = CATALOG_STATUS_INITIAL_FILTERS;
