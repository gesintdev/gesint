import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const LEAVE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
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
