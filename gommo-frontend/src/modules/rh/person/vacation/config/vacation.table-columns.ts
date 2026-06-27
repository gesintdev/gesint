import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const VACATION_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "startDate",
        columnName: "Início",
        fieldValue: "startDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "endDate",
        columnName: "Fim",
        fieldValue: "endDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "vacationDaysEntitled",
        columnName: "Dias direito",
        fieldValue: "vacationDaysEntitled",
        dataType: TableDataType.FLOAT,
    },
    {
        id: "pecuniaryAllowanceDays",
        columnName: "Abono (dias)",
        fieldValue: "pecuniaryAllowanceDays",
        dataType: TableDataType.FLOAT,
    },
    {
        id: "approved",
        columnName: "Aprovado",
        fieldValue: "approved",
        dataType: TableDataType.BOOLEAN,
    },
];
