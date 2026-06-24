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
        avatarTagsField: "admissionTags",
        avatarTagLabels: {
            IN_VACATION: "Em Férias",
            ON_LEAVE: "Afastado",
        },
        avatarTagClassNames: {
            IN_VACATION: "border-success/25 bg-success/12 text-success dark:border-success/35 dark:bg-success/18",
            ON_LEAVE: "border-warning/25 bg-warning/12 text-warning dark:border-warning/35 dark:bg-warning/18",
        },
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
