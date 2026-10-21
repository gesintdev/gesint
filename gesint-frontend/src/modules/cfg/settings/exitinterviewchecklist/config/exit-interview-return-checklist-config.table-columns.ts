import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const EXIT_INTERVIEW_RETURN_CHECKLIST_CONFIG_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "description",
        columnName: "Item",
        fieldValue: "description",
        dataType: TableDataType.TEXT,
    },
    {
        id: "itemKey",
        columnName: "Chave",
        fieldValue: "itemKey",
        dataType: TableDataType.TEXT,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
    {
        id: "displayOrder",
        columnName: "Ordem",
        fieldValue: "displayOrder",
        dataType: TableDataType.FLOAT,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
