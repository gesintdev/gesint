import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const ADMISSION_PROCESS_KANBAN_COLUMN_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "name",
        columnName: "Coluna",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    {
        id: "columnKey",
        columnName: "Chave",
        fieldValue: "columnKey",
        dataType: TableDataType.TEXT,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
    {
        id: "color",
        columnName: "Cor",
        fieldValue: "color",
        dataType: TableDataType.COLOR,
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
