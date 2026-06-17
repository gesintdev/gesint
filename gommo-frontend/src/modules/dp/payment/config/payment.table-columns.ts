import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig,TableDataType } from "@/shared/types/table.types";

export const PAYMENT_PERIOD_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "referencePeriod",
        columnName: "Competência",
        fieldValue: "referencePeriod",
        dataType: TableDataType.TEXT,
    },
    {
        id: "createdAt",
        columnName: "Criado em",
        fieldValue: "createdAt",
        dataType: TableDataType.DATETIME,
    },
    {
        id: "updatedAt",
        columnName: "Atualizado em",
        fieldValue: "updatedAt",
        dataType: TableDataType.DATETIME,
    },
];

export const PAYMENT_BATCH_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "batchType",
        columnName: "Tipo",
        fieldValue: "batchTypeLabel",
        dataType: TableDataType.TEXT,
    },
    {
        id: "description",
        columnName: "Descrição",
        fieldValue: "description",
        dataType: TableDataType.TEXT,
    },
    {
        id: "itemCount",
        columnName: "Itens",
        fieldValue: "itemCount",
        dataType: TableDataType.TEXT,
    },
    {
        id: "divergentCount",
        columnName: "Divergentes",
        fieldValue: "divergentCount",
        dataType: TableDataType.TEXT,
    },
    {
        id: "batchStatus",
        columnName: "Status",
        fieldValue: "batchStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            PROCESSING: "Processando",
            PROCESSED: "Processado",
            PARTIALLY_SENT: "Parcial",
            SENT: "Enviado",
        },
    },
    {
        id: "createdAt",
        columnName: "Data de criação",
        fieldValue: "createdAt",
        dataType: TableDataType.DATETIME,
    },
];

export const PAYMENT_SLIP_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "collaboratorName",
        columnName: "Nome",
        fieldValue: "displayName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "processedAt",
        columnName: "Data de processamento",
        fieldValue: "processedAt",
        dataType: TableDataType.DATE,
    },
    {
        id: "slipStatus",
        columnName: "Status",
        fieldValue: "slipStatus",
        dataType: TableDataType.BADGE,
        badgeLabels: {
            PROCESSED: "Processado",
            DIVERGENT: "Divergente",
            NOT_FOUND: "Não encontrado",
            SENT: "Enviado",
        },
    },
];

export const PAYMENT_SLIP_DIVERGENT_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "extractedNameDisplay",
        columnName: "Nome no documento",
        fieldValue: "extractedNameDisplay",
        dataType: TableDataType.TEXT,
    },
    {
        id: "matchedNameDisplay",
        columnName: "Nome encontrado",
        fieldValue: "matchedNameDisplay",
        dataType: TableDataType.TEXT,
    },
];

export const PAYMENT_SLIP_NOT_FOUND_TABLE_COLUMNS: TableColumnConfig[] = [
    {
        id: "extractedNameDisplay",
        columnName: "Nome no documento",
        fieldValue: "extractedNameDisplay",
        dataType: TableDataType.TEXT,
    },
];
