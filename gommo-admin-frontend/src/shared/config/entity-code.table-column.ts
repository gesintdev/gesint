import { type TableColumnConfig,TableDataType } from "@/shared/types/table.types";
/** Coluna padrão de código sequencial (primeira coluna das grids de entidade). */
export const ENTITY_CODE_TABLE_COLUMN: TableColumnConfig = {
    id: "code",
    columnName: "Código",
    fieldValue: "code",
    dataType: TableDataType.TEXT,
    align: "right",
    className: "tabular-nums w-20",
    headerClassName: "w-20",
};
