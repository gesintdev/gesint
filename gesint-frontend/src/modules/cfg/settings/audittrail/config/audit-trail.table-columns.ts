import {
    AUDIT_CATEGORY_BADGE_CLASSES,
    AUDIT_CATEGORY_LABELS,
} from "@/modules/cfg/settings/audittrail/lib/audit-trail.options";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export const AUDIT_TRAIL_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "occurredAt",
        columnName: "Quando",
        fieldValue: "occurredAt",
        dataType: TableDataType.DATETIME,
        notFilterable: true,
    },
    {
        id: "actorLabel",
        columnName: "Quem",
        fieldValue: "actorLabel",
        dataType: TableDataType.TEXT,
        notFilterable: true,
    },
    {
        id: "category",
        columnName: "Categoria",
        fieldValue: "category",
        dataType: TableDataType.BADGE,
        badgeLabels: AUDIT_CATEGORY_LABELS,
        badgeClassNames: AUDIT_CATEGORY_BADGE_CLASSES,
        notFilterable: true,
    },
    {
        id: "actionLabel",
        columnName: "Ação",
        fieldValue: "actionLabel",
        dataType: TableDataType.TEXT,
        notFilterable: true,
    },
    {
        id: "recordLabel",
        columnName: "Registro",
        fieldValue: "recordLabel",
        dataType: TableDataType.TEXT,
        notFilterable: true,
    },
    {
        id: "reason",
        columnName: "Motivo",
        fieldValue: "reason",
        dataType: TableDataType.TEXT,
        className: "max-w-[18rem] truncate",
        notFilterable: true,
    },
];
