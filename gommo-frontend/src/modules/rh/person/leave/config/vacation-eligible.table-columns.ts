import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const VACATION_ELIGIBLE_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.AVATAR_PROFILE,
        avatarImageField: "photoObjectId",
        avatarSubtitleField: "cpf",
        avatarSize: "sm",
    },
    {
        id: "hireDate",
        columnName: LEAVE_VACATION_CRUD_LABELS.columnAdmission,
        fieldValue: "hireDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "periodStatus",
        columnName: "Situação",
        fieldValue: "periodStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            CONCESSIVE: "Apto",
            EXPIRED: "Férias vencidas",
        },
    },
    {
        id: "acquisitionStart",
        columnName: LEAVE_VACATION_CRUD_LABELS.columnPeriod,
        fieldValue: "acquisitionStart",
        dataType: TableDataType.DATE,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
    },
    {
        id: "entitledDays",
        columnName: "Direito (dias)",
        fieldValue: "entitledDays",
        dataType: TableDataType.TEXT,
    },
    {
        id: "unjustifiedAbsences",
        columnName: "Faltas",
        fieldValue: "unjustifiedAbsences",
        dataType: TableDataType.TEXT,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
    {
        id: "concessiveEnd",
        columnName: "Limite concessivo",
        fieldValue: "concessiveEnd",
        dataType: TableDataType.DATE,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
    },
];
