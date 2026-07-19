import { JOB_VACANCY_SENIORITY_LABELS } from "@/modules/rh/person/jobvacancy/lib/job-vacancy.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const JOB_VACANCY_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    { id: "jobTitle", columnName: "Cargo", fieldValue: "jobTitle", dataType: TableDataType.TEXT },
    {
        id: "positionsCount",
        columnName: "Posições",
        fieldValue: "positionsCount",
        dataType: TableDataType.INTEGER,
    },
    {
        id: "seniorityLevel",
        columnName: "Senioridade",
        fieldValue: "seniorityLevel",
        dataType: TableDataType.BADGE,
        badgeLabels: JOB_VACANCY_SENIORITY_LABELS,
    },
    {
        id: "expectedCompletionDate",
        columnName: "Previsão",
        fieldValue: "expectedCompletionDate",
        dataType: TableDataType.DATE,
    },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
