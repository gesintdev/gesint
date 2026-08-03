import { OCCUPATIONAL_EXAM_TYPE_LABELS } from "@/modules/rh/person/occupational-exam/lib/occupational-exam.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const EXAM_REQUIREMENT_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "examType",
        columnName: "Tipo",
        fieldValue: "examType",
        dataType: TableDataType.BADGE,
        badgeLabels: OCCUPATIONAL_EXAM_TYPE_LABELS,
    },
    {
        id: "versionNumber",
        columnName: "Versao",
        fieldValue: "versionNumber",
        dataType: TableDataType.TEXT,
    },
    {
        id: "periodicityMonths",
        columnName: "Periodicidade (meses)",
        fieldValue: "periodicityMonths",
        dataType: TableDataType.TEXT,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
    },
    {
        id: "validFrom",
        columnName: "Vigente de",
        fieldValue: "validFrom",
        dataType: TableDataType.DATE,
    },
    {
        id: "validUntil",
        columnName: "Vigente ate",
        fieldValue: "validUntil",
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
