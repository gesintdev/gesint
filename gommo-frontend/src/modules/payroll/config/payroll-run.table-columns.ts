import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { PAYROLL_STATUS_LABELS } from "@/modules/payroll/config/payroll.constants";

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
        dataType: TableDataType.BADGE,
        badgeLabels: PAYROLL_STATUS_LABELS,
    },
    {
        id: "openedAt",
        columnName: "Abertura",
        fieldValue: "openedAt",
        dataType: TableDataType.DATE,
    },
    {
        id: "closedAt",
        columnName: "Fechamento",
        fieldValue: "closedAt",
        dataType: TableDataType.DATE,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
