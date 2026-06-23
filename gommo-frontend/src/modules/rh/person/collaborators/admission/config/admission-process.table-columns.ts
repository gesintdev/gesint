import { ADMISSION_STATUS_LABELS } from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

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
        badgeLabels: ADMISSION_STATUS_LABELS,
    },
    {
        id: "expectedStartDate",
        columnName: "Data de início",
        fieldValue: "expectedStartDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "departmentName",
        columnName: "Departamento",
        fieldValue: "departmentName",
        dataType: TableDataType.TEXT,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
];
