import {DOCUMENT_DATA_CLASS_LABELS} from "@/modules/cfg/settings/documenttype/lib/document-type.options";
import {ENTITY_CODE_TABLE_COLUMN} from "@/shared/config/entity-code.table-column";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export const DOCUMENT_TYPE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "typeCode",
        columnName: "Código",
        fieldValue: "typeCode",
        dataType: TableDataType.TEXT,
    },
    {
        id: "name",
        columnName: "Nome",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    {
        id: "dataClass",
        columnName: "Classe",
        fieldValue: "dataClass",
        dataType: TableDataType.BADGE,
        badgeLabels: DOCUMENT_DATA_CLASS_LABELS,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
        align: "center",
    },
];
