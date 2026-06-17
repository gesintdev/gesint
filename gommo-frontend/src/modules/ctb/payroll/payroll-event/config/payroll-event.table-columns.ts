import { PAYROLL_EVENT_TYPE_LABELS } from "@/modules/ctb/payroll/config/payroll.constants";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig,TableDataType } from "@/shared/types/table.types";

export const PAYROLL_EVENT_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "eventCode",
        columnName: "Chave",
        fieldValue: "eventCode",
        dataType: TableDataType.TEXT,
    },
    {
        id: "description",
        columnName: "Descrição",
        fieldValue: "description",
        dataType: TableDataType.TEXT,
    },
    {
        id: "eventType",
        columnName: "Tipo",
        fieldValue: "eventType",
        dataType: TableDataType.BADGE,
        badgeLabels: PAYROLL_EVENT_TYPE_LABELS,
    },
    {
        id: "incidesInss",
        columnName: "INSS",
        fieldValue: "incidesInss",
        dataType: TableDataType.BOOLEAN,
    },
    {
        id: "incidesFgts",
        columnName: "FGTS",
        fieldValue: "incidesFgts",
        dataType: TableDataType.BOOLEAN,
    },
    {
        id: "incidesIrrf",
        columnName: "IRRF",
        fieldValue: "incidesIrrf",
        dataType: TableDataType.BOOLEAN,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
