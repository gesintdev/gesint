import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const CLIENT_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "name",
        columnName: "Nome",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    {
        id: "slug",
        columnName: "Slug",
        fieldValue: "slug",
        dataType: TableDataType.TEXT,
    },
    {
        id: "document",
        columnName: "Documento",
        fieldValue: "document",
        dataType: TableDataType.TEXT,
    },
    {
        id: "routingMode",
        columnName: "Roteamento",
        fieldValue: "routingMode",
        dataType: TableDataType.TEXT,
    },
    {
        id: "databaseStrategy",
        columnName: "Estratégia DB",
        fieldValue: "databaseStrategy",
        dataType: TableDataType.TEXT,
    },
    {
        id: "contactEmail",
        columnName: "E-mail",
        fieldValue: "contactEmail",
        dataType: TableDataType.EMAIL,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
    {
        id: "provisioningStatus",
        columnName: "Provisionamento",
        fieldValue: "provisioningStatus",
        dataType: TableDataType.BADGE,
    },
];
