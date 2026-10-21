import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

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

export const ATTENDANCE_TABLE_COLUMNS: TableColumnConfig[] = [
    // Código — ver ATTENDANCE_TABLE_COLUMNS_HIDDEN
    // Data — ver ATTENDANCE_TABLE_COLUMNS_HIDDEN
    // Ocorrência — ver ATTENDANCE_TABLE_COLUMNS_HIDDEN
    // Origem — ver ATTENDANCE_TABLE_COLUMNS_HIDDEN
    // Horários — removido da listagem (totais do período substituem)
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.AVATAR_PROFILE,
        avatarImageField: "photoObjectId",
        avatarTagsField: "presenceTags",
        avatarTagLabels: {
            IN_VACATION: "Em Férias",
            ON_LEAVE: "Afastado",
            PENDING_ADJUSTMENT: "Solicitação de Ajuste",
        },
        avatarTagClassNames: {
            IN_VACATION: "border-success/25 bg-success/12 text-success dark:border-success/35 dark:bg-success/18",
            ON_LEAVE: "border-warning/25 bg-warning/12 text-warning dark:border-warning/35 dark:bg-warning/18",
            PENDING_ADJUSTMENT:
                "border-warning/25 bg-warning/12 text-warning dark:border-warning/35 dark:bg-warning/18",
        },
    },
    {
        id: "workScheduleName",
        columnName: "Escala",
        fieldValue: "workScheduleName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "workedHours",
        columnName: "Horas trabalhadas",
        fieldValue: "workedHours",
        dataType: TableDataType.DECIMAL,
        align: "left",
        notFilterable: true,
    },
    {
        id: "creditHours",
        columnName: "Hora extra (crédito)",
        fieldValue: "creditHours",
        dataType: TableDataType.DECIMAL,
        align: "left",
        notFilterable: true,
    },
    {
        id: "debitHours",
        columnName: "Débito",
        fieldValue: "debitHours",
        dataType: TableDataType.DECIMAL,
        align: "left",
        notFilterable: true,
    },
];
