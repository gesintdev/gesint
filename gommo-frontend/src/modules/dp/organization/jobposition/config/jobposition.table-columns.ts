import { JOB_POSITION_NATURE_LABELS } from "@/modules/dp/organization/jobposition/lib/job-position.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const JOBPOSITION_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "title",
        columnName: "Título",
        fieldValue: "title",
        dataType: TableDataType.TEXT,
    },
    {
        id: "sharedAcrossBranches",
        columnName: "Disponibilidade",
        fieldValue: "sharedAcrossBranches",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            true: "Todas as filiais",
            false: "Filial ativa",
        },
    },
    {
        id: "cboCode",
        columnName: "CBO",
        fieldValue: "cboCode",
        dataType: TableDataType.TEXT,
    },
    {
        id: "nature",
        columnName: "Natureza",
        fieldValue: "nature",
        dataType: TableDataType.BADGE,
        badgeLabels: JOB_POSITION_NATURE_LABELS,
    },
    {
        id: "departmentId",
        columnName: "Departamento",
        fieldValue: "departmentId",
        dataType: TableDataType.UUID,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
