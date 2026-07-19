"use client";

import type { ReactNode } from "react";

import { DataTypeFactory } from "@/shared/lib/data-type/data-type.factory";
import { DataType } from "@/shared/types/data-type";

export type AdminGridCol<T> = {
    key: keyof T & string;
    label: string;
    width?: number | string;
    /** Tipo de dado: aplica máscara/formatação automática quando não há `render`. */
    dataType?: DataType;
    render?: (value: unknown, row: T) => ReactNode;
};

function formatCell<T extends Record<string, unknown>>(col: AdminGridCol<T>, row: T): ReactNode {
    const value = row[col.key];
    if (col.render) {
        return col.render(value, row);
    }
    if (col.dataType) {
        return DataTypeFactory.mask(value, col.dataType);
    }
    return value == null ? "" : String(value);
}

export function AdminDataGrid<T extends Record<string, unknown>>({
    cols,
    rows,
    onDoubleClick,
    emptyMsg = "Nenhum registro encontrado.",
}: {
    cols: AdminGridCol<T>[];
    rows: T[];
    onDoubleClick?: (row: T) => void;
    emptyMsg?: string;
}) {
    return (
        <div
            style={{
                border: "1px solid var(--ga-border)",
                borderRadius: "var(--ga-radius-sm)",
                overflow: "auto",
            }}
        >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "var(--ga-surface-2)" }}>
                        {cols.map((col) => (
                            <th
                                key={col.key}
                                style={{
                                    padding: "8px 12px",
                                    textAlign: "left",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "var(--ga-text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                    borderBottom: "1px solid var(--ga-border)",
                                    whiteSpace: "nowrap",
                                    width: col.width,
                                }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={cols.length}
                                style={{
                                    padding: 24,
                                    textAlign: "center",
                                    color: "var(--ga-text-muted)",
                                    fontSize: 13,
                                }}
                            >
                                {emptyMsg}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, index) => (
                            <tr
                                key={index}
                                onDoubleClick={() => onDoubleClick?.(row)}
                                style={{
                                    borderBottom: "1px solid var(--ga-border)",
                                    cursor: onDoubleClick ? "pointer" : "default",
                                    background: "var(--ga-surface)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--ga-surface-2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "var(--ga-surface)";
                                }}
                            >
                                {cols.map((col) => (
                                    <td
                                        key={col.key}
                                        style={{
                                            padding: "8px 12px",
                                            fontSize: 13,
                                            color: "var(--ga-text)",
                                            fontVariantNumeric: DataTypeFactory.hasMask(col.dataType)
                                                ? "tabular-nums"
                                                : undefined,
                                        }}
                                    >
                                        {formatCell(col, row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
