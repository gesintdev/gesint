import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export const PROFILE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "name",
        columnName: "Nome",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    {
        id: "system",
        columnName: "Sistema",
        fieldValue: "system",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            CFG: "CFG",
            DP: "DP",
            RH: "RH",
            CONTABILIDADE: "CTB",
        },
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
    {
        id: "description",
        columnName: "Descrição",
        fieldValue: "description",
        dataType: TableDataType.TEXT,
    },
];
