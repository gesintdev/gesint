import type {DataImportEntityType} from "@/modules/cfg/settings/dataimport/dto/data-import.dto";

export const dataImportKeys = {
    all: ["data-import"] as const,
    active: ["data-import", "active"] as const,
    locks: ["data-import", "locks"] as const,
    detail: (id: string) => ["data-import", "detail", id] as const,
    lock: (entityType: DataImportEntityType) => ["data-import", "lock", entityType] as const,
};
