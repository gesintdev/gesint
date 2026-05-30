import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const ATTENDANCE_TABLE_COLUMNS: TableColumnConfig[] = [
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
