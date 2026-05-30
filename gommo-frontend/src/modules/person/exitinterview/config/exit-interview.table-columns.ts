import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const EXITINTERVIEW_TABLE_COLUMNS: TableColumnConfig[] = [
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
