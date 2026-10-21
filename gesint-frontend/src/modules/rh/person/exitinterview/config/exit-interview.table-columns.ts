import {
    EXIT_INTERVIEW_STATUS_LABELS,
    EXIT_REASON_LABELS,
    TERMINATION_TYPE_LABELS,
} from "@/modules/rh/person/exitinterview/lib/exit-interview.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const EXITINTERVIEW_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador/prestador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "relationshipType",
        columnName: "Vinculo",
        fieldValue: "relationshipType",
        dataType: TableDataType.BADGE,
        badgeLabels: { CLT: "CLT", PJ: "PJ" },
    },
    {
        id: "interviewStatus",
        columnName: "Status",
        fieldValue: "interviewStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: EXIT_INTERVIEW_STATUS_LABELS,
    },
    {
        id: "interviewDate",
        columnName: "Entrevista",
        fieldValue: "interviewDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "terminationType",
        columnName: "Desligamento/encerramento",
        fieldValue: "terminationType",
        dataType: TableDataType.BADGE,
        badgeLabels: TERMINATION_TYPE_LABELS,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
    {
        id: "mainReason",
        columnName: "Motivo principal",
        fieldValue: "mainReason",
        dataType: TableDataType.BADGE,
        badgeLabels: EXIT_REASON_LABELS,
        className: "hidden xl:table-cell",
        headerClassName: "hidden xl:table-cell",
    },
    {
        id: "departmentName",
        columnName: "Setor",
        fieldValue: "departmentName",
        dataType: TableDataType.TEXT,
        className: "hidden xl:table-cell",
        headerClassName: "hidden xl:table-cell",
    },
];
