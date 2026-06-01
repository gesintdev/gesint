import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";

export const ADMISSION_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "fullName",
        columnName: "Colaborador",
        fieldValue: "fullName",
        dataType: TableDataType.AVATAR_PROFILE,
        avatarImageField: "photoObjectId",
        avatarSubtitleField: "cpf",
    },
    {
        id: "admissionStatus",
        columnName: "Status",
        fieldValue: "admissionStatus",
        dataType: TableDataType.BADGE,
    },
    {
        id: "expectedStartDate",
        columnName: "Previsão início",
        fieldValue: "expectedStartDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "email",
        columnName: "E-mail",
        fieldValue: "email",
        dataType: TableDataType.EMAIL,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
];
