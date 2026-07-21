import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

/** Férias no RH — solicitações ao DP e histórico concedido. */
export const LEAVE_HISTORY_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "rhVacationStatus",
        columnName: "Situação",
        fieldValue: "rhVacationStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            PENDING: "Aguardando DP",
            APPROVED: "Concedida",
            IN_VACATION: "Em férias",
            RETURNED: "Devolvida",
            REJECTED: "Reprovada",
        },
    },
    {
        id: "concessivePeriodLabel",
        columnName: "Período concessivo",
        fieldValue: "concessivePeriodLabel",
        dataType: TableDataType.TEXT,
    },
    {
        id: "gozoPeriodLabel",
        columnName: "Gozo",
        fieldValue: "gozoPeriodLabel",
        dataType: TableDataType.TEXT,
    },
    {
        id: "daysEntitledLabel",
        columnName: "Dias acordados",
        fieldValue: "daysEntitledLabel",
        dataType: TableDataType.TEXT,
        align: "right",
    },
    {
        id: "gozoDays",
        columnName: "Dias de gozo",
        fieldValue: "gozoDays",
        dataType: TableDataType.INTEGER,
        align: "right",
    },
    {
        id: "remainingDaysLabel",
        columnName: "Dias restantes",
        fieldValue: "remainingDaysLabel",
        dataType: TableDataType.TEXT,
        align: "right",
    },
    {
        id: "pecuniaryLabel",
        columnName: "Abono",
        fieldValue: "pecuniaryLabel",
        dataType: TableDataType.TEXT,
        align: "right",
    },
];
