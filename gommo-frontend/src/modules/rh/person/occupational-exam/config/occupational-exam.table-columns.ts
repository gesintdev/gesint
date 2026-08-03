import {
    OCCUPATIONAL_EXAM_LIFECYCLE_LABELS,
    OCCUPATIONAL_EXAM_RESULT_LABELS,
    OCCUPATIONAL_EXAM_TYPE_LABELS,
} from "@/modules/rh/person/occupational-exam/lib/occupational-exam.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const OCCUPATIONAL_EXAM_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "examType",
        columnName: "Tipo",
        fieldValue: "examType",
        dataType: TableDataType.BADGE,
        badgeLabels: OCCUPATIONAL_EXAM_TYPE_LABELS,
    },
    {
        id: "lifecycleStatus",
        columnName: "Status",
        fieldValue: "lifecycleStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: OCCUPATIONAL_EXAM_LIFECYCLE_LABELS,
    },
    {
        id: "dueDate",
        columnName: "Vencimento",
        fieldValue: "dueDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "result",
        columnName: "Aptidao",
        fieldValue: "result",
        dataType: TableDataType.BADGE,
        badgeLabels: OCCUPATIONAL_EXAM_RESULT_LABELS,
    },
    {
        id: "scheduledDate",
        columnName: "Agendado",
        fieldValue: "scheduledDate",
        dataType: TableDataType.DATE,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
];
