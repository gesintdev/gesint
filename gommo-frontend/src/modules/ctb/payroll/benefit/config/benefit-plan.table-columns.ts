import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig,TableDataType } from "@/shared/types/table.types";

export const BENEFIT_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "name",
        columnName: "Nome",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    {
        id: "benefitType",
        columnName: "Tipo",
        fieldValue: "benefitType",
        dataType: TableDataType.TEXT,
    },
    {
        id: "monthlyValue",
        columnName: "Valor mensal",
        fieldValue: "monthlyValue",
        dataType: TableDataType.CURRENCY,
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
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
