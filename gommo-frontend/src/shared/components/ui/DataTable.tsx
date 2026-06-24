import clsx from "clsx";
import get from "lodash/get";
import type { MouseEvent, ReactNode } from "react";

import { ProfileAvatar } from "@/shared/components/ui/ProfileAvatar";
import { badgeClassForStatus, formatBadgeCellValue, formatCellValue } from "@/shared/lib/table/format-cell-value";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

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
    onRowActivate?: (_row: T) => void;
    /** `click` (padrão) ou `doubleclick` */
    rowActivateOn?: DataTableRowActivateOn;
    /** @deprecated Use `onRowActivate` + `rowActivateOn="click"` */
    onRowClick?: (_row: T) => void;
    /** @deprecated Use `onRowActivate` + `rowActivateOn="doubleclick"` */
    onRowDoubleClick?: (_row: T) => void;
    renderActions?: (_row: T) => ReactNode;
    actionsHeader?: string;
    actionsClassName?: string;
    renderColumnHeader?: (_column: TableColumnConfig) => ReactNode;
    getRowClassName?: (_row: T) => string | undefined;
};

function resolveRowInteraction<T extends object>(props: DataTableProps<T>) {
    const { onRowActivate, onRowClick, onRowDoubleClick, rowActivateOn } = props;
    const mode: DataTableRowActivateOn = rowActivateOn ?? (onRowDoubleClick && !onRowClick ? "doubleclick" : "click");
    const handler = onRowActivate ?? (mode === "doubleclick" ? onRowDoubleClick : onRowClick);
    return { mode, handler, interactive: Boolean(handler) };
}

function alignClass(align?: TableColumnConfig["align"]) {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
}

function normalizeProfileTags(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function renderCellContent(
    value: unknown,
    dataType: TableDataType | undefined,
    row: object,
    col: TableColumnConfig,
): ReactNode {
    if (dataType === TableDataType.AVATAR_PROFILE) {
        const name = value != null && value !== "" ? String(value) : "—";
        const photoObjectId = col.avatarImageField ? (get(row, col.avatarImageField) as string | undefined) : undefined;
        const subtitle = col.avatarSubtitleField ? get(row, col.avatarSubtitleField) : undefined;
        const tags = col.avatarTagsField ? normalizeProfileTags(get(row, col.avatarTagsField)) : [];
        const avatarSize = col.avatarSize ?? "lg";
        const denseProfile = avatarSize === "sm";
        return (
            <div className={clsx("flex items-center", denseProfile ? "gap-2" : "gap-2.5")}>
                <ProfileAvatar name={name} photoObjectId={photoObjectId} size={avatarSize} shape="squircle" />
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="min-w-0">
                        <span
                            className={clsx(
                                "block truncate text-base-content",
                                denseProfile ? "text-sm font-medium" : "font-semibold",
                            )}
                        >
                            {name}
                        </span>
                        {subtitle != null && subtitle !== "" ? (
                            <div
                                className={clsx(
                                    "truncate opacity-50 tabular-nums",
                                    denseProfile ? "text-xs" : "text-sm",
                                )}
                            >
                                {formatCellValue(subtitle, TableDataType.CPF)}
                            </div>
                        ) : null}
                    </div>
                    {tags.length > 0 ? (
                        <span className="flex shrink-0 items-center gap-1.5">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className={clsx(
                                        "inline-flex h-5 items-center rounded-full border px-1.5 text-[10px] font-medium leading-none",
                                        col.avatarTagClassNames?.[tag] ??
                                            "border-base-content/10 bg-base-content/5 text-base-content/55",
                                    )}
                                >
                                    {col.avatarTagLabels?.[tag] ?? tag}
                                </span>
                            ))}
                        </span>
                    ) : null}
                </div>
            </div>
        );
    }

    if (dataType === TableDataType.EMAIL && value) {
        const email = String(value);
        return (
            <a href={`mailto:${email}`} className="text-primary underline-offset-2 hover:underline">
                {email}
            </a>
        );
    }

    if (dataType === TableDataType.BADGE && value != null && value !== "") {
        return (
            <span className={clsx("gommo-badge", badgeClassForStatus(value, col.badgeLabels))}>
                {formatBadgeCellValue(value, col.badgeLabels)}
            </span>
        );
    }
    const formatted = formatCellValue(value, dataType);
    const isNumeric =
        dataType === TableDataType.CPF ||
        dataType === TableDataType.PHONE ||
        dataType === TableDataType.FLOAT ||
        dataType === TableDataType.CURRENCY ||
        dataType === TableDataType.PERCENT;
    return <span className={clsx("text-[0.78125rem]", isNumeric && "tabular-nums")}>{formatted}</span>;
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
    onRowClick,
    onRowDoubleClick,
    renderActions,
    actionsHeader = "Ações",
    actionsClassName,
    renderColumnHeader,
    getRowClassName,
}: DataTableProps<T>) {
    const { mode, handler, interactive } = resolveRowInteraction({
        data,
        columns,
        onRowActivate,
        rowActivateOn,
        onRowClick,
        onRowDoubleClick,
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
                        {columns.map((col) => (
                            <th
                                key={col.id}
                                className={clsx("bg-transparent", alignClass(col.align), col.headerClassName)}
                            >
                                {renderColumnHeader?.(col) ?? col.columnName}
                            </th>
                        ))}
                        {hasActions && (
                            <th className={clsx("bg-transparent text-right", actionsClassName)}>{actionsHeader}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan} className="py-16 text-center text-sm text-base-content/38">
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
                                    className={clsx(interactive && "cursor-pointer", getRowClassName?.(row))}
                                >
                                    {columns.map((col) => {
                                        const raw = get(row, col.fieldValue);
                                        const isPrimary = col.fieldValue === columns[0]?.fieldValue;
                                        return (
                                            <td
                                                key={col.id}
                                                className={clsx(
                                                    alignClass(col.align),
                                                    col.dataType !== TableDataType.AVATAR_PROFILE &&
                                                        isPrimary &&
                                                        "font-medium text-base-content",
                                                    col.dataType !== TableDataType.AVATAR_PROFILE &&
                                                        !isPrimary &&
                                                        "text-base-content/70",
                                                    col.className,
                                                )}
                                            >
                                                {renderCellContent(raw, col.dataType, row, col)}
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
