import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const JOBPOSITION_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "title",
        columnName: "Título",
        fieldValue: "title",
        dataType: TableDataType.TEXT,
    },
    {
        id: "cboCode",
        columnName: "CBO",
        fieldValue: "cboCode",
        dataType: TableDataType.TEXT,
    },
    {
        id: "departmentId",
        columnName: "Departamento",
        fieldValue: "departmentId",
        dataType: TableDataType.UUID,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
