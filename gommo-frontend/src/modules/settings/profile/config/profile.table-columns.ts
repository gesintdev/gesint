import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const PROFILE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "name",
        columnName: "Nome",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    {
        id: "system",
        columnName: "Sistema",
        fieldValue: "system",
        dataType: TableDataType.TEXT,
    },
    {
        id: "description",
        columnName: "Descrição",
        fieldValue: "description",
        dataType: TableDataType.TEXT,
    },
];
