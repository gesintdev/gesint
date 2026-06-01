import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const CLIENT_USER_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "displayName",
        columnName: "Nome",
        fieldValue: "displayName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "username",
        columnName: "Usuário",
        fieldValue: "username",
        dataType: TableDataType.TEXT,
    },
    {
        id: "email",
        columnName: "E-mail",
        fieldValue: "email",
        dataType: TableDataType.EMAIL,
    },
    {
        id: "clientName",
        columnName: "Cliente",
        fieldValue: "clientName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
