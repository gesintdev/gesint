import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig,TableDataType } from "@/shared/types/table.types";

export const CLIENT_SUBSCRIPTION_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    { id: "planCode", columnName: "Plano", fieldValue: "planCode", dataType: TableDataType.TEXT },
    { id: "billingStatus", columnName: "Cobrança", fieldValue: "billingStatus", dataType: TableDataType.BADGE },
    { id: "monthlyAmount", columnName: "Valor mensal", fieldValue: "monthlyAmount", dataType: TableDataType.TEXT },
    { id: "startedAt", columnName: "Início", fieldValue: "startedAt", dataType: TableDataType.TEXT },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
