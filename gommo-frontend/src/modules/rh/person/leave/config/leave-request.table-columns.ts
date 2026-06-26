import { LEAVE_ABSENCE_STATUS_LABELS } from "@/modules/rh/person/leave/lib/leave-types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const LEAVE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "leaveType",
        columnName: "Tipo",
        fieldValue: "leaveType",
        dataType: TableDataType.BADGE,
    },
    {
        id: "absenceStatus",
        columnName: "Status",
        fieldValue: "absenceStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: LEAVE_ABSENCE_STATUS_LABELS,
    },
    {
        id: "startDate",
        columnName: "Inicio",
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
        id: "durationDays",
        columnName: "Dias",
        fieldValue: "durationDays",
        dataType: TableDataType.FLOAT,
        align: "right",
    },
    {
        id: "requiresInss",
        columnName: "INSS",
        fieldValue: "requiresInss",
        dataType: TableDataType.BOOLEAN,
    },
];
