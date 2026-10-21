import { DataTypeFactory } from "@/shared/lib/data-type/data-type.factory";
import { DataType } from "@/shared/types/data-type";

/** Formata valor de célula; delega para {@link DataTypeFactory}. */
export function formatCellValue(value: unknown, dataType: DataType = DataType.STRING): string {
    return DataTypeFactory.mask(value, dataType);
}

export function badgeClassForStatus(value: unknown): string {
    const normalized = String(value).toUpperCase();
    if (normalized === "ACTIVE" || normalized === "READY" || normalized === "COMPLETED") {
        return "gesint-badge--success";
    }
    if (normalized === "INACTIVE" || normalized === "PENDING" || normalized === "PROVISIONING") {
        return "gesint-badge--warning";
    }
    if (normalized === "DELETED" || normalized === "CANCELLED" || normalized === "ERROR") {
        return "gesint-badge--error";
    }
    if (normalized === "DRAFT" || normalized === "IN_PROGRESS") return "gesint-badge--info";
    return "gesint-badge--neutral";
}
