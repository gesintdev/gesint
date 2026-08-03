import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const MEDICAL_CLINIC_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "corporateName",
        columnName: "Razao social",
        fieldValue: "corporateName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "cnpj",
        columnName: "CNPJ",
        fieldValue: "cnpj",
        dataType: TableDataType.TEXT,
    },
    {
        id: "phone",
        columnName: "Telefone",
        fieldValue: "phone",
        dataType: TableDataType.TEXT,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
    },
    {
        id: "accreditationValidUntil",
        columnName: "Credenciamento",
        fieldValue: "accreditationValidUntil",
        dataType: TableDataType.DATE,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
        align: "center",
    },
];
