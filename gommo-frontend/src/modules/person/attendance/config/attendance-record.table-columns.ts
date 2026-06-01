import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const ATTENDANCE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorId",
        columnName: "Colaborador",
        fieldValue: "collaboratorId",
        dataType: TableDataType.UUID,
    },
    {
        id: "workDate",
        columnName: "Data",
        fieldValue: "workDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "clockIn",
        columnName: "Entrada",
        fieldValue: "clockIn",
        dataType: TableDataType.TEXT,
    },
    {
        id: "clockOut",
        columnName: "Saída",
        fieldValue: "clockOut",
        dataType: TableDataType.TEXT,
    },
];
