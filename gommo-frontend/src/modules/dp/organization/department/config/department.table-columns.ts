import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export const DEPARTMENT_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "name",
        columnName: "Nome",
        fieldValue: "name",
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
        id: "costCenter",
        columnName: "Centro de custo",
        fieldValue: "costCenter",
        dataType: TableDataType.TEXT,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
