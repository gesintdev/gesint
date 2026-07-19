import type { ProductSystem, ProductSystemCreateDto } from "@/modules/productsystem/dto/productsystem.dto";

export function emptyProductSystemForm(): ProductSystemCreateDto {
    return {
        key: "",
        name: "",
        description: "",
        defaultPrice: undefined,
        withAiAvailable: false,
        sortOrder: 0,
        notes: "",
    };
}

export function productSystemToForm(system: ProductSystem): ProductSystemCreateDto {
    return {
        key: system.key ?? "",
        name: system.name ?? "",
        description: system.description ?? "",
        defaultPrice: system.defaultPrice,
        withAiAvailable: Boolean(system.withAiAvailable),
        sortOrder: system.sortOrder ?? 0,
        notes: system.notes ?? "",
    };
}

export function statusLabel(status?: string): string {
    switch (status) {
        case "ACTIVE":
            return "Ativo";
        case "INACTIVE":
            return "Inativo";
        case "DELETED":
            return "Excluído";
        default:
            return status ?? "—";
    }
}

export function productSystemOptionLabel(system: ProductSystem): string {
    return `${system.key} — ${system.name}`;
}
