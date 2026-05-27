import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
export const CLIENT_SUBSCRIPTION_TABLE_COLUMNS: TableColumnConfig[] = [
    { id: "planCode", columnName: "Plano", fieldValue: "planCode", dataType: TableDataType.TEXT },
    { id: "billingStatus", columnName: "Cobrança", fieldValue: "billingStatus", dataType: TableDataType.BADGE },
    { id: "monthlyAmount", columnName: "Valor mensal", fieldValue: "monthlyAmount", dataType: TableDataType.TEXT },
    { id: "startedAt", columnName: "Início", fieldValue: "startedAt", dataType: TableDataType.TEXT },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
