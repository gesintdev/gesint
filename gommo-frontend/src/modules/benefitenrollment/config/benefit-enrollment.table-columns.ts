import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const BENEFIT_ENROLLMENT_TABLE_COLUMNS: TableColumnConfig[] = [
    { id: "startDate", columnName: "Início", fieldValue: "startDate", dataType: TableDataType.DATE },
    { id: "endDate", columnName: "Fim", fieldValue: "endDate", dataType: TableDataType.DATE },
    { id: "monthlyValue", columnName: "Valor mensal", fieldValue: "monthlyValue", dataType: TableDataType.CURRENCY },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
