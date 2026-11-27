import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

/** Selo da coluna Pendências: "Em dia" (verde) ou a quantidade de dias a resolver (alerta). */
export const PENDING_BADGE_CLASS_NAMES: Record<string, string> = {
    "Em dia": "gesint-badge--success",
    "*": "gesint-badge--warning",
};

/**
 * Colunas ocultas da listagem de presença — manter para reativação futura.
 * Não remover DTOs/campos de backend; só o mapeamento da grid.
 */
export const ATTENDANCE_TABLE_COLUMNS_HIDDEN: TableColumnConfig[] = [
    {
        ...ENTITY_CODE_TABLE_COLUMN,
        className: "tabular-nums w-14",
        headerClassName: "w-14",
    },
    {
        id: "workDate",
        columnName: "Data",
        fieldValue: "workDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "occurrenceType",
        columnName: "Ocorrência",
        fieldValue: "occurrenceType",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            NORMAL_WORK: "Trabalho normal",
            TIME_ADJUSTMENT: "Ajuste de ponto",
            MEDICAL_CERTIFICATE: "Atestado médico",
            LEAVE_ABSENCE: "Afastamento",
            UNJUSTIFIED_ABSENCE: "Falta injustificada",
            LATE_ARRIVAL: "Atraso",
            VACATION: "Férias",
            LICENSE: "Licença",
        },
    },
    {
        id: "occurrenceOrigin",
        columnName: "Origem",
        fieldValue: "occurrenceOrigin",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            MANUAL: "Manual",
            LEAVE_REQUEST: "Solicitação",
            MOBILE: "App",
        },
    },
];

const COLLABORATOR_COLUMN: TableColumnConfig = {
    id: "collaboratorName",
    columnName: "Colaborador",
    fieldValue: "collaboratorName",
    dataType: TableDataType.AVATAR_PROFILE,
    avatarImageField: "photoObjectId",
    avatarSubtitleField: "jobTitle",
    avatarTagsField: "presenceTags",
    avatarTagLabels: {
        IN_VACATION: "Em férias",
        ON_LEAVE: "Afastado",
        PENDING_ADJUSTMENT: "Ajuste pendente",
    },
    avatarTagClassNames: {
        IN_VACATION: "border-info/25 bg-info/12 text-info dark:border-info/35 dark:bg-info/18",
        ON_LEAVE: "border-warning/25 bg-warning/12 text-warning dark:border-warning/35 dark:bg-warning/18",
        PENDING_ADJUSTMENT: "border-warning/25 bg-warning/12 text-warning dark:border-warning/35 dark:bg-warning/18",
    },
};

/**
 * Grid do Controle de ponto: um resumo por colaborador no período.
 * Horas extras só aparecem quando a empresa trabalha com esse regime; o saldo do banco de horas
 * (acumulado até o fim do período) substitui a antiga coluna Débito.
 */
export function buildAttendanceTableColumns(options: {
    overtimeEnabled: boolean;
    hourBankEnabled: boolean;
}): TableColumnConfig[] {
    const columns: TableColumnConfig[] = [
        COLLABORATOR_COLUMN,
        {
            id: "workScheduleName",
            columnName: "Escala",
            fieldValue: "workScheduleName",
            dataType: TableDataType.TEXT,
        },
        {
            id: "workedMinutes",
            columnName: "Horas trabalhadas",
            fieldValue: "workedMinutes",
            dataType: TableDataType.DURATION,
            notFilterable: true,
        },
    ];
    if (options.overtimeEnabled) {
        columns.push({
            id: "overtimeMinutes",
            columnName: "Horas extras",
            fieldValue: "overtimeMinutes",
            dataType: TableDataType.DURATION,
            notFilterable: true,
        });
    }
    if (options.hourBankEnabled) {
        columns.push({
            id: "hourBankBalanceMinutes",
            columnName: "Banco de horas",
            fieldValue: "hourBankBalanceMinutes",
            dataType: TableDataType.BALANCE,
            notFilterable: true,
        });
    }
    columns.push({
        id: "pendingCount",
        columnName: "Pendências",
        fieldValue: "pendingLabel",
        dataType: TableDataType.BADGE,
        badgeClassNames: PENDING_BADGE_CLASS_NAMES,
        notFilterable: true,
    });
    return columns;
}
