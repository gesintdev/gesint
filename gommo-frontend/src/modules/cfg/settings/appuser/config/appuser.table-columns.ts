import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export const APP_USER_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
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
        id: "dpRoles",
        columnName: "Perfis DP",
        fieldValue: "dpRolesLabel",
        dataType: TableDataType.TEXT,
    },
    {
        id: "rhRoles",
        columnName: "Perfis RH",
        fieldValue: "rhRolesLabel",
        dataType: TableDataType.TEXT,
    },
];
