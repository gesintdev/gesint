import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const DISMISSAL_TYPE_LABELS: Record<string, string> = {
    WITHOUT_CAUSE: "Sem justa causa",
    WITH_CAUSE: "Com justa causa",
    RESIGNATION: "Pedido de demissão",
    AGREEMENT: "Acordo",
    END_OF_CONTRACT: "Fim de contrato",
    OTHER: "Outro",
};

const OFFBOARDING_STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Desligado",
    INACTIVE: "Inativo",
    DELETED: "Excluído",
};

export const OFFBOARDING_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    { id: "dismissalDate", columnName: "Data", fieldValue: "dismissalDate", dataType: TableDataType.DATE },
    {
        id: "dismissalType",
        columnName: "Tipo",
        fieldValue: "dismissalType",
        dataType: TableDataType.BADGE,
        badgeLabels: DISMISSAL_TYPE_LABELS,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
        badgeLabels: OFFBOARDING_STATUS_LABELS,
    },
];
