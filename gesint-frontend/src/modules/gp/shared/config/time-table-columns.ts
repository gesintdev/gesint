import type { AttendanceDayStatus } from "@/modules/gp/shared/dto/time-management.dto";
import { DAY_STATUS_LABELS, DAY_STATUS_TONE } from "@/modules/gp/shared/lib/time-labels";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

/** Colaborador com foto e cargo (subtítulo), padrão das grids do GP. */
export const GP_COLLABORATOR_COLUMN: TableColumnConfig = {
    id: "collaboratorName",
    columnName: "Colaborador",
    fieldValue: "collaboratorName",
    dataType: TableDataType.AVATAR_PROFILE,
    avatarImageField: "photoObjectId",
    avatarSubtitleField: "jobTitle",
};

const DAY_STATUS_BADGE_LABELS = Object.fromEntries(
    (Object.keys(DAY_STATUS_LABELS) as AttendanceDayStatus[]).map((status) => [status, DAY_STATUS_LABELS[status].label]),
);

const DAY_STATUS_BADGE_CLASS = Object.fromEntries(
    (Object.keys(DAY_STATUS_TONE) as AttendanceDayStatus[]).map((status) => [
        status,
        `gesint-badge--${DAY_STATUS_TONE[status]}`,
    ]),
);

/** Situação apurada do dia (Completo, Incompleto, Sem registro, Folga...). */
export function dayStatusColumn(field = "status"): TableColumnConfig {
    return {
        id: field,
        columnName: "Situação",
        fieldValue: field,
        dataType: TableDataType.BADGE,
        badgeLabels: DAY_STATUS_BADGE_LABELS,
        badgeClassNames: DAY_STATUS_BADGE_CLASS,
    };
}

export function durationColumn(id: string, columnName: string): TableColumnConfig {
    return { id, columnName, fieldValue: id, dataType: TableDataType.DURATION, notFilterable: true };
}

export function balanceColumn(id: string, columnName: string): TableColumnConfig {
    return { id, columnName, fieldValue: id, dataType: TableDataType.BALANCE, notFilterable: true };
}
