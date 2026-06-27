import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const CLIENT_PAYMENT_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    { id: "referenceCode", columnName: "Referência", fieldValue: "referenceCode", dataType: TableDataType.TEXT },
    { id: "amount", columnName: "Valor", fieldValue: "amount", dataType: TableDataType.TEXT },
    { id: "dueDate", columnName: "Vencimento", fieldValue: "dueDate", dataType: TableDataType.TEXT },
    { id: "paymentStatus", columnName: "Pagamento", fieldValue: "paymentStatus", dataType: TableDataType.BADGE },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
