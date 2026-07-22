import { JOB_VACANCY_APPLICATION_STATUS_LABELS } from "@/modules/rh/person/jobvacancyapplication/lib/job-vacancy-application.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const JOB_VACANCY_APPLICATION_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "jobVacancyTitle",
        columnName: "Vaga",
        fieldValue: "jobVacancyTitle",
        dataType: TableDataType.TEXT,
    },
    {
        id: "candidateFullName",
        columnName: "Candidato",
        fieldValue: "candidateFullName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "candidateCpf",
        columnName: "CPF",
        fieldValue: "candidateCpf",
        dataType: TableDataType.CPF,
    },
    {
        id: "applicationStatus",
        columnName: "Situação",
        fieldValue: "applicationStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: JOB_VACANCY_APPLICATION_STATUS_LABELS,
    },
    {
        id: "appliedAt",
        columnName: "Candidatura",
        fieldValue: "appliedAt",
        dataType: TableDataType.DATETIME,
    },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
