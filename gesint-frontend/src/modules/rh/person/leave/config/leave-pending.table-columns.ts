import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";
/** Solicitações de férias pendentes (DP). */
export const LEAVE_PENDING_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "startDate",
        columnName: "Início solicitado",
        fieldValue: "startDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "endDate",
        columnName: "Fim solicitado",
        fieldValue: "endDate",
        dataType: TableDataType.DATE,
    },
];
