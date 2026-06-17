import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
/** Férias no RH — solicitações ao DP e histórico concedido. */
export const LEAVE_HISTORY_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "startDate",
        columnName: "Início",
        fieldValue: "startDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "endDate",
        columnName: "Fim",
        fieldValue: "endDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "rhVacationStatus",
        columnName: "Situação",
        fieldValue: "rhVacationStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            PENDING: "Aguardando DP",
            APPROVED: "Concedida",
            RETURNED: "Devolvida",
            REJECTED: "Reprovada",
        },
    },
];
