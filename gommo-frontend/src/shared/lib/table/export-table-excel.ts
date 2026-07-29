import get from "lodash/get";

import {formatBadgeCellValue, formatCellValue} from "@/shared/lib/table/format-cell-value";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function cellText(row: object, column: TableColumnConfig): string {
    const raw = get(row, column.fieldValue);
    if (column.dataType === TableDataType.AVATAR_PROFILE) {
        return raw == null || raw === "" ? "" : String(raw);
    }
    if (column.dataType === TableDataType.BADGE) {
        const label = formatBadgeCellValue(raw, column.badgeLabels);
        return label === "—" ? "" : label;
    }
    const formatted = formatCellValue(raw, column.dataType);
    return formatted === "—" ? "" : formatted;
}

function downloadBlob(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

export type ExportTableExcelInput<T extends object> = {
    rows: T[];
    columns: TableColumnConfig[];
    fileName?: string;
    sheetTitle?: string;
};

/** Gera planilha simples (.xls via HTML) com header azul claro — sem dependência NPM. */
export function exportTableToExcel<T extends object>({
    rows,
    columns,
    fileName = "exportacao",
    sheetTitle = "Dados",
}: ExportTableExcelInput<T>) {
    if (columns.length === 0) return;

    const headerCells = columns
        .map(
            (column) =>
                `<th style="background:#BFDBFE;color:#0f172a;font-weight:700;border:1px solid #93c5fd;padding:6px 8px;text-align:left;">${escapeHtml(column.columnName)}</th>`,
        )
        .join("");

    const bodyRows = rows
        .map((row) => {
            const cells = columns
                .map(
                    (column) =>
                        `<td style="border:1px solid #e2e8f0;padding:6px 8px;vertical-align:top;">${escapeHtml(cellText(row, column))}</td>`,
                )
                .join("");
            return `<tr>${cells}</tr>`;
        })
        .join("");

    const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${escapeHtml(sheetTitle.slice(0, 31))}</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body>
<table>
<thead><tr>${headerCells}</tr></thead>
<tbody>${bodyRows}</tbody>
</table>
</body>
</html>`;

    const safeName = fileName.replace(/[^\w\-À-ÿ]+/gi, "_").replace(/_+/g, "_") || "exportacao";
    downloadBlob(
        `${safeName}.xls`,
        new Blob(["\uFEFF", html], {type: "application/vnd.ms-excel;charset=utf-8"}),
    );
}
