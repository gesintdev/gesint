import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const DEVELOPMENT_PLAN_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    { id: "collaboratorName", columnName: "Colaborador", fieldValue: "collaboratorName", dataType: TableDataType.TEXT },
    { id: "jobPositionName", columnName: "Cargo", fieldValue: "jobPositionName", dataType: TableDataType.TEXT },
    { id: "departmentName", columnName: "Departamento", fieldValue: "departmentName", dataType: TableDataType.TEXT },
    { id: "managerName", columnName: "Gestor", fieldValue: "managerName", dataType: TableDataType.TEXT },
    { id: "planStatus", columnName: "Status", fieldValue: "planStatus", dataType: TableDataType.BADGE },
    { id: "progress", columnName: "Progresso", fieldValue: "progress", dataType: TableDataType.PERCENT },
    { id: "startDate", columnName: "Início", fieldValue: "startDate", dataType: TableDataType.DATE },
    { id: "endDate", columnName: "Fim", fieldValue: "endDate", dataType: TableDataType.DATE },
];