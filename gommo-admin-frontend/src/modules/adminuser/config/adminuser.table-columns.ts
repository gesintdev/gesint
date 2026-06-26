import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig,TableDataType } from "@/shared/types/table.types";

export const ADMIN_USER_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "fullName",
        columnName: "Nome",
        fieldValue: "fullName",
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
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
