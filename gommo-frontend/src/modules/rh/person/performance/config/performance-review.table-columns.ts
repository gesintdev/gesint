import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const PERFORMANCE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    { id: "periodStart", columnName: "Início", fieldValue: "periodStart", dataType: TableDataType.DATE },
    { id: "periodEnd", columnName: "Fim", fieldValue: "periodEnd", dataType: TableDataType.DATE },
    { id: "rating", columnName: "Classificação", fieldValue: "rating", dataType: TableDataType.TEXT },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
