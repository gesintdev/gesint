import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const PAYROLL_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "referenceYear",
        columnName: "Ano",
        fieldValue: "referenceYear",
        dataType: TableDataType.TEXT,
    },
    {
        id: "referenceMonth",
        columnName: "Mês",
        fieldValue: "referenceMonth",
        dataType: TableDataType.TEXT,
    },
    {
        id: "payrollStatus",
        columnName: "Status folha",
        fieldValue: "payrollStatus",
        dataType: TableDataType.TEXT,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
