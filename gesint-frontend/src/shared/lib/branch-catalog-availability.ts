import type {Branch} from "@/shared/lib/branch";

type CatalogAvailabilityRow = {
    companyId?: string | null;
};

export function resolveCatalogAvailabilityLabel(
    companyId: string | null | undefined,
    branches: Branch[],
): string {
    if (companyId == null) {
        return "Total";
    }
    return branches.find((branch) => branch.id === companyId)?.name ?? "—";
}

export function withCatalogAvailabilityLabel<T extends CatalogAvailabilityRow>(
    rows: T[],
    branches: Branch[],
): (T & {availabilityLabel: string})[] {
    return rows.map((row) => ({
        ...row,
        availabilityLabel: resolveCatalogAvailabilityLabel(row.companyId, branches),
    }));
}
