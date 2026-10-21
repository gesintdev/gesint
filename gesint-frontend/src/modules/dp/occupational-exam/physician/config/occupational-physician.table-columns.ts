import { OCCUPATIONAL_PHYSICIAN_ROLE_LABELS } from "@/modules/dp/occupational-exam/physician/lib/occupational-physician.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const OCCUPATIONAL_PHYSICIAN_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "fullName",
        columnName: "Nome",
        fieldValue: "fullName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "crm",
        columnName: "CRM",
        fieldValue: "crm",
        dataType: TableDataType.TEXT,
    },
    {
        id: "crmState",
        columnName: "UF",
        fieldValue: "crmState",
        dataType: TableDataType.TEXT,
    },
    {
        id: "role",
        columnName: "Papel",
        fieldValue: "role",
        dataType: TableDataType.BADGE,
        badgeLabels: OCCUPATIONAL_PHYSICIAN_ROLE_LABELS,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
        align: "center",
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
];
