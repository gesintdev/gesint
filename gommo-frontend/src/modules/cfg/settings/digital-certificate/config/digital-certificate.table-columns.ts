import {
    DIGITAL_CERTIFICATE_ENVIRONMENT_LABELS,
    DIGITAL_CERTIFICATE_PURPOSE_LABELS,
} from "@/modules/cfg/settings/digital-certificate/lib/digital-certificate.options";
import { ENTITY_CODE_TABLE_COLUMN } from "@/shared/config/entity-code.table-column";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

export const DIGITAL_CERTIFICATE_TABLE_COLUMNS: TableColumnConfig[] = [
    ENTITY_CODE_TABLE_COLUMN,
    {
        id: "alias",
        columnName: "Alias",
        fieldValue: "alias",
        dataType: TableDataType.TEXT,
    },
    {
        id: "purpose",
        columnName: "Finalidade",
        fieldValue: "purpose",
        dataType: TableDataType.BADGE,
        badgeLabels: DIGITAL_CERTIFICATE_PURPOSE_LABELS,
    },
    {
        id: "environment",
        columnName: "Ambiente",
        fieldValue: "environment",
        dataType: TableDataType.BADGE,
        badgeLabels: DIGITAL_CERTIFICATE_ENVIRONMENT_LABELS,
    },
    {
        id: "ownerDocument",
        columnName: "CNPJ/CPF",
        fieldValue: "ownerDocument",
        dataType: TableDataType.TEXT,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
    },
    {
        id: "validUntil",
        columnName: "Valido ate",
        fieldValue: "validUntil",
        dataType: TableDataType.DATE,
    },
    {
        id: "isDefault",
        columnName: "Padrao",
        fieldValue: "isDefault",
        dataType: TableDataType.BOOLEAN,
        align: "center",
    },
    {
        id: "status",
        columnName: "Status",
        fieldValue: "status",
        dataType: TableDataType.BADGE,
        align: "center",
    },
];
