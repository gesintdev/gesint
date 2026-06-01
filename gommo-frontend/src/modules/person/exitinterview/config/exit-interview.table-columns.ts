import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const EXITINTERVIEW_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorId",
        columnName: "Colaborador",
        fieldValue: "collaboratorId",
        dataType: TableDataType.UUID,
    },
    {
        id: "interviewDate",
        columnName: "Data",
        fieldValue: "interviewDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "departureReason",
        columnName: "Motivo",
        fieldValue: "departureReason",
        dataType: TableDataType.TEXT,
    },
];
