import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig,TableDataType } from "@/shared/types/table.types";

export const TAX_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    { id: "obligationType", columnName: "Tipo", fieldValue: "obligationType", dataType: TableDataType.TEXT },
    { id: "startDate", columnName: "Início", fieldValue: "startDate", dataType: TableDataType.DATE },
    { id: "endDate", columnName: "Fim", fieldValue: "endDate", dataType: TableDataType.DATE },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
