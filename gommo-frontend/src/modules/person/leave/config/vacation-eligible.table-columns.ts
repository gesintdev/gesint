import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/person/leave/config/leave-vacation.route-labels";
import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const VACATION_ELIGIBLE_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "collaboratorName",
        columnName: "Colaborador",
        fieldValue: "collaboratorName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "hireDate",
        columnName: LEAVE_VACATION_CRUD_LABELS.columnAdmission,
        fieldValue: "hireDate",
        dataType: TableDataType.DATE,
    },
    {
        id: "periodStatus",
        columnName: LEAVE_VACATION_CRUD_LABELS.columnPeriod,
        fieldValue: "periodStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            AVAILABLE: "Apto",
            CONCESSIVE: "Concessivo",
            ACQUIRING: "Aquisitivo",
            EXPIRED: "Vencido",
            FORFEITED: "Perdido",
        },
    },
    {
        id: "entitledDays",
        columnName: "Direito (dias)",
        fieldValue: "entitledDays",
        dataType: TableDataType.TEXT,
    },
    {
        id: "unjustifiedAbsences",
        columnName: "Faltas injust.",
        fieldValue: "unjustifiedAbsences",
        dataType: TableDataType.TEXT,
    },
    {
        id: "justifiedAbsences",
        columnName: "Atestados",
        fieldValue: "justifiedAbsences",
        dataType: TableDataType.TEXT,
    },
    {
        id: "concessiveEnd",
        columnName: "Limite concessivo",
        fieldValue: "concessiveEnd",
        dataType: TableDataType.DATE,
    },
];
