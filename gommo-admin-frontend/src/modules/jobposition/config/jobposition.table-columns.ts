import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const JOBPOSITION_TABLE_COLUMNS: TableColumnConfig[] = [
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
        columnName: "Dept. ID",
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
