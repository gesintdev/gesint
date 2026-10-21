import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const COMPANY_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "legalName",
        columnName: "Razão social",
        fieldValue: "legalName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "cnpj",
        columnName: "CNPJ",
        fieldValue: "cnpj",
        dataType: TableDataType.TEXT,
    },
    {
        id: "city",
        columnName: "Cidade",
        fieldValue: "city",
        dataType: TableDataType.TEXT,
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
    },
];
