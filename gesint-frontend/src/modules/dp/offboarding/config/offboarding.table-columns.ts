import {DISMISSAL_TYPE_LABELS} from "@/modules/dp/offboarding/lib/offboarding-labels";
import {PROCESS_STATUS_LABELS} from "@/modules/dp/offboarding/lib/offboarding.options";
import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export {DISMISSAL_TYPE_LABELS};

export const OFFBOARDING_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "lastWorkDay",
        columnName: "Último dia",
        fieldValue: "lastWorkDay",
        dataType: TableDataType.DATE,
    },
    {
        id: "esocialDismissalReasonLabel",
        columnName: "Motivo eSocial",
        fieldValue: "esocialDismissalReasonLabel",
        dataType: TableDataType.TEXT,
    },
    {
        id: "dismissalType",
        columnName: "Tipo",
        fieldValue: "dismissalType",
        dataType: TableDataType.BADGE,
        badgeLabels: DISMISSAL_TYPE_LABELS,
    },
    {
        id: "processStatus",
        columnName: "Processo",
        fieldValue: "processStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: PROCESS_STATUS_LABELS,
    },
];
