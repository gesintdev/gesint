import { OBLIGATION_TYPE_LABELS } from "@/modules/ctb/payroll/tax/lib/tax-obligation.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const TAX_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "obligationType",
        columnName: "Tipo",
        fieldValue: "obligationType",
        dataType: TableDataType.BADGE,
        badgeLabels: OBLIGATION_TYPE_LABELS,
    },
    { id: "startDate", columnName: "Início", fieldValue: "startDate", dataType: TableDataType.DATE },
    { id: "endDate", columnName: "Fim", fieldValue: "endDate", dataType: TableDataType.DATE },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
