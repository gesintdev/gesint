"use client";

import clsx from "clsx";
import get from "lodash/get";
import type { MouseEvent, ReactNode } from "react";

import { DataTypeFactory } from "@/shared/lib/data-type/data-type.factory";
import { badgeClassForStatus, formatCellValue } from "@/shared/lib/table/format-cell-value";
import { DataType } from "@/shared/types/data-type";
import { type TableColumnConfig } from "@/shared/types/table.types";

export type DataTableRowActivateOn = "click" | "doubleclick";

export type DataTableProps<T extends object> = {
    data: T[];
    columns: TableColumnConfig[];
    rowKey?: string;
    emptyMessage?: string;
    compact?: boolean;
    striped?: boolean;
    stickyHeader?: boolean;
    /** Ação ao ativar a linha (ver `rowActivateOn`) */
    onRowActivate?: (row: T) => void;
    /** `click` (padrão) ou `doubleclick` */
    rowActivateOn?: DataTableRowActivateOn;
    renderActions?: (row: T) => ReactNode;
    actionsHeader?: string;
    actionsClassName?: string;
};

function resolveRowInteraction<T extends object>(props: Pick<DataTableProps<T>, "onRowActivate" | "rowActivateOn">) {
    const mode: DataTableRowActivateOn = props.rowActivateOn ?? "click";
    const handler = props.onRowActivate;
    return { mode, handler, interactive: Boolean(handler) };
}

function alignClass(align?: TableColumnConfig["align"]) {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
}

function renderCellContent(value: unknown, dataType?: DataType): ReactNode {
    if (dataType === DataType.EMAIL && value) {
        const email = String(value);
        return (
            <a href={`mailto:${email}`} className="text-primary underline-offset-2 hover:underline">
                {email}
            </a>
        );
    }

    if (dataType === DataType.BADGE && value != null && value !== "") {
        return (
            <span className={clsx("gommo-badge", badgeClassForStatus(value))}>
                {formatCellValue(value, DataType.BADGE)}
            </span>
        );
    }
    const formatted = formatCellValue(value, dataType);
    return (
        <span className={clsx("text-sm", DataTypeFactory.hasMask(dataType) && "tabular-nums")}>
            {formatted}
        </span>
    );
}

export function DataTable<T extends object>({
    data,
    columns,
    rowKey = "id",
    emptyMessage = "Nenhum registro encontrado.",
    compact = true,
    striped = false,
    stickyHeader = true,
    onRowActivate,
    rowActivateOn,
    renderActions,
    actionsHeader = "Ações",
    actionsClassName,
}: DataTableProps<T>) {
    const { mode, handler, interactive } = resolveRowInteraction({
        onRowActivate,
        rowActivateOn,
    });
    const hasActions = Boolean(renderActions);
    const colSpan = columns.length + (hasActions ? 1 : 0);
    const stopRowClick = (e: MouseEvent) => e.stopPropagation();

    return (
        <div className="overflow-x-auto">
            <table
                className={clsx("gommo-table", compact && "gommo-table--compact", striped && "gommo-table--striped")}
            >
                <thead className={clsx(stickyHeader && "sticky top-0 z-[1]")}>
                    <tr>
                        {columns.map((col, colIndex) => (
                            <th
                                key={col.id || col.fieldValue || `col-${colIndex}`}
                                className={clsx("bg-transparent", alignClass(col.align), col.headerClassName)}
                            >
                                {col.columnName}
                            </th>
                        ))}
                        {hasActions && (
                            <th key="__actions" className={clsx("bg-transparent text-right", actionsClassName)}>
                                {actionsHeader}
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan} className="py-20 text-center text-sm text-base-content/38">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => {
                            const key = String(get(row, rowKey) ?? index);
                            return (
                                <tr
                                    key={key}
                                    onClick={interactive && mode === "click" ? () => handler?.(row) : undefined}
                                    onDoubleClick={
                                        interactive && mode === "doubleclick" ? () => handler?.(row) : undefined
                                    }
                                    className={clsx(interactive && "cursor-pointer")}
                                >
                                    {columns.map((col, colIndex) => {
                                        const raw = get(row, col.fieldValue);
                                        const isPrimary = col.fieldValue === columns[0]?.fieldValue;
                                        return (
                                            <td
                                                key={col.id || col.fieldValue || `col-${colIndex}`}
                                                className={clsx(
                                                    alignClass(col.align),
                                                    isPrimary && "font-semibold text-base-content",
                                                    !isPrimary && "text-base-content/70",
                                                    col.className,
                                                )}
                                            >
                                                {renderCellContent(raw, col.dataType)}
                                            </td>
                                        );
                                    })}
                                    {hasActions && (
                                        <td className={clsx("text-right", actionsClassName)}>
                                            <div
                                                className="gommo-table-actions"
                                                onClick={stopRowClick}
                                                onDoubleClick={stopRowClick}
                                            >
                                                {renderActions?.(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
