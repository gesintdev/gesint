import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const OFFBOARDING_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    { id: "collaboratorId", columnName: "Colaborador", fieldValue: "collaboratorId", dataType: TableDataType.UUID },
    { id: "dismissalDate", columnName: "Data", fieldValue: "dismissalDate", dataType: TableDataType.DATE },
    { id: "dismissalType", columnName: "Tipo", fieldValue: "dismissalType" },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
