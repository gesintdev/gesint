import { PAYROLL_STATUS_LABELS } from "@/modules/ctb/payroll/config/payroll.constants";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

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
