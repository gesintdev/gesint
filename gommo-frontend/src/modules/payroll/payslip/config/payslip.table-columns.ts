import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const PAYSLIP_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "payrollRunId",
        columnName: "Processamento",
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
