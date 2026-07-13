import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const COLLABORATOR_STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Desligado",
    DELETED: "Excluído",
};
export const COLLABORATOR_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "fullName",
        columnName: "Nome",
        fieldValue: "fullName",
        dataType: TableDataType.STRING,
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
        badgeLabels: COLLABORATOR_STATUS_LABELS,
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
