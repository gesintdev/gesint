import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const LEAVE_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "collaboratorId",
        columnName: "Colaborador",
        fieldValue: "collaboratorId",
        dataType: TableDataType.UUID,
    },
    {
        id: "leaveType",
        columnName: "Tipo",
        fieldValue: "leaveType",
        dataType: TableDataType.BADGE,
    },
    {
        id: "startDate",
        columnName: "Início",
        fieldValue: "startDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "approved",
        columnName: "Aprovado",
        fieldValue: "approved",
        dataType: TableDataType.BOOLEAN,
    },
];
