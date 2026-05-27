import {TableDataType, type TableColumnConfig} from "@/shared/types/table.types";

export const COLLABORATOR_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "fullName",
        columnName: "Nome",
        fieldValue: "fullName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "cpf",
        columnName: "CPF",
        fieldValue: "cpf",
        dataType: TableDataType.CPF,
        className: "hidden sm:table-cell",
        headerClassName: "hidden sm:table-cell",
    },
    {
        id: "birthDate",
        columnName: "Nascimento",
        fieldValue: "birthDate",
        dataType: TableDataType.DATE,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
        align: "center",
    },
    {
        id: "updatedAt",
        columnName: "Atualizado",
        fieldValue: "updatedAt",
        dataType: TableDataType.DATETIME,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
];
