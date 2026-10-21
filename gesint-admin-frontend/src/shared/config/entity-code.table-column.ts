import { DataType } from "@/shared/types/data-type";
import { type TableColumnConfig } from "@/shared/types/table.types";

/** Coluna padrão de código sequencial (primeira coluna das grids de entidade). */
export const ENTITY_CODE_TABLE_COLUMN: TableColumnConfig = {
    id: "code",
    columnName: "Código",
    fieldValue: "code",
    dataType: DataType.INTEGER,
    align: "right",
    className: "tabular-nums w-20",
    headerClassName: "w-20",
};
