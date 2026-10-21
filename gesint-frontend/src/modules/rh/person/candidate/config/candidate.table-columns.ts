import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const CANDIDATE_STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
};

export const CANDIDATE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    { id: "fullName", columnName: "Nome", fieldValue: "fullName", dataType: TableDataType.TEXT },
    { id: "cpf", columnName: "CPF", fieldValue: "cpf", dataType: TableDataType.CPF },
    { id: "email", columnName: "E-mail", fieldValue: "email", dataType: TableDataType.TEXT },
    { id: "phone", columnName: "Telefone", fieldValue: "phone", dataType: TableDataType.PHONE },
    { id: "birthDate", columnName: "Nascimento", fieldValue: "birthDate", dataType: TableDataType.DATE },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
        badgeLabels: CANDIDATE_STATUS_LABELS,
    },
];
