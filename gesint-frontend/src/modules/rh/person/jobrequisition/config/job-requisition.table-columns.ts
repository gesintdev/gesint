import {
    JOB_REQUISITION_REASON_LABELS,
    JOB_REQUISITION_STATUS_LABELS,
} from "@/modules/rh/person/jobrequisition/lib/job-requisition.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const JOB_REQUISITION_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "jobPositionTitle",
        columnName: "Cargo",
        fieldValue: "jobPositionTitle",
        dataType: TableDataType.TEXT,
    },
    {
        id: "salaryLevel",
        columnName: "Nível",
        fieldValue: "salaryLevel",
        dataType: TableDataType.TEXT,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
    },
    {
        id: "reason",
        columnName: "Motivo",
        fieldValue: "reason",
        dataType: TableDataType.BADGE,
        badgeLabels: JOB_REQUISITION_REASON_LABELS,
    },
    {
        id: "replacedCollaboratorName",
        columnName: "Substitui",
        fieldValue: "replacedCollaboratorName",
        dataType: TableDataType.TEXT,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
    {
        id: "proposedSalary",
        columnName: "Salário proposto",
        fieldValue: "proposedSalary",
        dataType: TableDataType.MONEY,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
    {
        id: "desiredStartDate",
        columnName: "Início desejado",
        fieldValue: "desiredStartDate",
        dataType: TableDataType.DATE,
        className: "hidden xl:table-cell",
        headerClassName: "hidden xl:table-cell",
    },
    {
        id: "requisitionStatus",
        columnName: "Situação",
        fieldValue: "requisitionStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: JOB_REQUISITION_STATUS_LABELS,
    },
];
