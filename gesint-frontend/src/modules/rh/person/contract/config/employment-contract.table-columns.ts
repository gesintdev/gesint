import { CONTRACT_TYPE_LABELS } from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const CONTRACT_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorId",
        columnName: "Colaborador",
        fieldValue: "collaboratorId",
        dataType: TableDataType.UUID,
    },
    {
        id: "contractType",
        columnName: "Tipo",
        fieldValue: "contractType",
        dataType: TableDataType.BADGE,
        badgeLabels: CONTRACT_TYPE_LABELS,
    },
    {
        id: "startDate",
        columnName: "Início",
        fieldValue: "startDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
