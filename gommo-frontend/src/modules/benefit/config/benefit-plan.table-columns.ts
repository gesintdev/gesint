import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const BENEFIT_TABLE_COLUMNS: TableColumnConfig[] = [
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
