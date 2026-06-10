type RowWithCreatedAt = { createdAt?: string | null };

export function sortRowsByCreatedAtDesc<T extends RowWithCreatedAt>(rows: T[]): T[] {
    if (rows.length === 0 || rows.every((row) => row.createdAt == null)) {
        return rows;
    }
    return [...rows].sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : Number.NEGATIVE_INFINITY;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : Number.NEGATIVE_INFINITY;
        return bTime - aTime;
    });
}
