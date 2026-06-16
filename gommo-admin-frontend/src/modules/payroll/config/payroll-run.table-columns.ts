import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const PAYROLL_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "referencePeriod",
        columnName: "Competência",
        fieldValue: "referencePeriod",
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
