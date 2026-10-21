import { EXPERIENCE_PERIOD_STATUS_LABELS } from "@/modules/rh/person/experience/lib/experience-evaluation.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const EXPERIENCE_EVALUATION_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "jobPositionName",
        columnName: "Cargo",
        fieldValue: "jobPositionName",
        dataType: TableDataType.TEXT,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
    },
    {
        id: "admissionDate",
        columnName: "Admissão",
        fieldValue: "admissionDate",
        dataType: TableDataType.DATE,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
    {
        id: "milestoneLabel",
        columnName: "Marco",
        fieldValue: "milestoneLabel",
        dataType: TableDataType.TEXT,
    },
    {
        id: "experienceDueDate",
        columnName: "Vence em",
        fieldValue: "experienceDueDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "selectionVsExperience",
        columnName: "Seleção × Experiência",
        fieldValue: "selectionVsExperience",
        dataType: TableDataType.TEXT,
        className: "hidden xl:table-cell",
        headerClassName: "hidden xl:table-cell",
    },
    {
        id: "periodStatus",
        columnName: "Status",
        fieldValue: "periodStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: EXPERIENCE_PERIOD_STATUS_LABELS,
    },
];
