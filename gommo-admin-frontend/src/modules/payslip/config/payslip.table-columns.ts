import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const PAYSLIP_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "payrollRunId",
        columnName: "Folha ID",
        fieldValue: "payrollRunId",
        dataType: TableDataType.UUID,
    },
    {
        id: "collaboratorId",
        columnName: "Colaborador",
        fieldValue: "collaboratorId",
        dataType: TableDataType.UUID,
    },
    {
        id: "grossAmount",
        columnName: "Bruto",
        fieldValue: "grossAmount",
        dataType: TableDataType.CURRENCY,
    },
    {
        id: "netAmount",
        columnName: "Líquido",
        fieldValue: "netAmount",
        dataType: TableDataType.CURRENCY,
    },
];
