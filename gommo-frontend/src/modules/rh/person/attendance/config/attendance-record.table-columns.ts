import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig,TableDataType } from "@/shared/types/table.types";

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
        id: "occurrenceType",
        columnName: "Ocorrencia",
        fieldValue: "occurrenceType",
        dataType: TableDataType.BADGE,
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
