import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export const ATTENDANCE_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        ...ENTITY_CODE_TABLE_COLUMN,
        className: "tabular-nums w-14",
        headerClassName: "w-14",
    },
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.AVATAR_PROFILE,
        avatarImageField: "photoObjectId",
        avatarTagsField: "presenceTags",
        avatarTagLabels: {
            PRESENT: "Presente",
            ABSENT: "Ausente",
            IN_VACATION: "Em Férias",
            ON_LEAVE: "Afastado",
        },
        avatarTagClassNames: {
            PRESENT: "border-primary/25 bg-primary/12 text-primary dark:border-primary/35 dark:bg-primary/18",
            ABSENT: "border-warning/25 bg-warning/12 text-warning dark:border-warning/35 dark:bg-warning/18",
            IN_VACATION: "border-success/25 bg-success/12 text-success dark:border-success/35 dark:bg-success/18",
            ON_LEAVE: "border-warning/25 bg-warning/12 text-warning dark:border-warning/35 dark:bg-warning/18",
        },
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
    {
        id: "schedule",
        columnName: "Horários",
        fieldValue: "schedule",
        dataType: TableDataType.TEXT,
        notFilterable: true,
        className: "tabular-nums whitespace-nowrap",
    },
    {
        id: "workedHours",
        columnName: "Horas trabalhadas",
        fieldValue: "workedHours",
        dataType: TableDataType.DECIMAL,
        align: "right",
        notFilterable: true,
    },
];
