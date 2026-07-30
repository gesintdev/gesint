import {TableColumnConfig, TableDataType} from "@/shared/types/table.types";

export const REQUEST_COLUMNS: TableColumnConfig[] = [
    {id: "code", columnName: "Código", fieldValue: "code", dataType: TableDataType.TEXT},
    {id: "collaboratorName", columnName: "Colaborador", fieldValue: "collaboratorName", dataType: TableDataType.TEXT},
    {id: "workDate", columnName: "Data", fieldValue: "workDate", dataType: TableDataType.DATE},
    {id: "requestTypeLabel", columnName: "Tipo", fieldValue: "requestTypeLabel", dataType: TableDataType.TEXT},
    {id: "requestStatusLabel", columnName: "Status", fieldValue: "requestStatusLabel", dataType: TableDataType.TEXT},
    {id: "clockInCompare", columnName: "Entrada", fieldValue: "clockInCompare", dataType: TableDataType.TEXT},
    {
        id: "breakStartCompare",
        columnName: "Saída almoço",
        fieldValue: "breakStartCompare",
        dataType: TableDataType.TEXT
    },
    {id: "breakEndCompare", columnName: "Retorno almoço", fieldValue: "breakEndCompare", dataType: TableDataType.TEXT},
    {id: "clockOutCompare", columnName: "Saída", fieldValue: "clockOutCompare", dataType: TableDataType.TEXT},
    {id: "notes", columnName: "Justificativa", fieldValue: "notes", dataType: TableDataType.TEXT},
];
