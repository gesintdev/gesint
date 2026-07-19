import { DataTypeFactory } from "@/shared/lib/data-type/data-type.factory";
import { DataType } from "@/shared/types/data-type";

/** Formata valor de célula; delega para {@link DataTypeFactory}. */
export function formatCellValue(value: unknown, dataType: DataType = DataType.STRING): string {
    return DataTypeFactory.mask(value, dataType);
}

export function badgeClassForStatus(value: unknown): string {
    const normalized = String(value).toUpperCase();
    if (normalized === "ACTIVE" || normalized === "READY" || normalized === "COMPLETED") {
        return "gommo-badge--success";
    }
    if (normalized === "INACTIVE" || normalized === "PENDING" || normalized === "PROVISIONING") {
        return "gommo-badge--warning";
    }
    if (normalized === "DELETED" || normalized === "CANCELLED" || normalized === "ERROR") {
        return "gommo-badge--error";
    }
    if (normalized === "DRAFT" || normalized === "IN_PROGRESS") return "gommo-badge--info";
    return "gommo-badge--neutral";
}
