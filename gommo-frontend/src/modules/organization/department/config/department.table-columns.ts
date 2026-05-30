import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const DEPARTMENT_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "name",
        columnName: "Nome",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    {
        id: "costCenter",
        columnName: "Centro de custo",
        fieldValue: "costCenter",
        dataType: TableDataType.TEXT,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
