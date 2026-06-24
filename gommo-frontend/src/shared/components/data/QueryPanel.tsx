import { type QueryKey, useQuery, type UseQueryResult } from "@tanstack/react-query";
import clsx from "clsx";
import { Funnel, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { QueryRefreshProvider } from "@/shared/components/data/QueryRefreshContext";
import { TablePagination } from "@/shared/components/data/TablePagination";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableRowActivateOn } from "@/shared/components/ui/DataTable";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import { ExceptionCapture } from "@/shared/exceptions";
import { formatBadgeCellValue, formatCellValue } from "@/shared/lib/table/format-cell-value";
import { sortRowsByCreatedAtDesc } from "@/shared/lib/table/sort-rows-by-created-at";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";
/** Props do render prop de {@link QueryPanel} (lista: `data` é sempre `TRow[]`). */
export type QueryPanelRenderProps<TRow> = {
    data: TRow[];
    refetch: UseQueryResult<TRow[]>["refetch"];
    isFetching: boolean;
};

type QueryPanelProps<TRow extends object> = {
    queryKey: QueryKey;
    request: () => Promise<TRow[]>;
    children: (_props: QueryPanelRenderProps<TRow>) => ReactNode;
    fallback?: ReactNode;
    errorFallback?: (_error: Error, _retry: () => void) => ReactNode;
    showRefresh?: boolean;
};

export type QueryTablePanelTableProps<TRow extends object> = {
    rowKey?: string;
    emptyMessage?: string;
    compact?: boolean;
    striped?: boolean;
    stickyHeader?: boolean;
    onRowActivate?: (_row: TRow) => void;
    rowActivateOn?: DataTableRowActivateOn;
    /** @deprecated Use `onRowActivate` + `rowActivateOn="click"` */
    onRowClick?: (_row: TRow) => void;
    /** @deprecated Use `onRowActivate` + `rowActivateOn="doubleclick"` */
    onRowDoubleClick?: (_row: TRow) => void;
    renderActions?: (_row: TRow) => ReactNode;
    actionsHeader?: string;
    actionsClassName?: string;
    getRowClassName?: (_row: TRow) => string | undefined;
};

export type QueryTablePanelProps<TRow extends object> = QueryTablePanelTableProps<TRow> & {
    queryKey: QueryKey;
    request: () => Promise<TRow[]>;
    columns: TableColumnConfig[];
    showRefresh?: boolean;
    fallback?: ReactNode;
    errorFallback?: (_error: Error, _retry: () => void) => ReactNode;
};

export type QueryPagedTablePanelProps<TRow extends object> = QueryTablePanelTableProps<TRow> & {
    queryKey: QueryKey;
    request: (_page: number, _size: number, _filters: Record<string, string[]>) => Promise<PageableResponseDto<TRow>>;
    columns: TableColumnConfig[];
    pageSize?: number;
    pageSizeOptions?: number[];
    fallback?: ReactNode;
    errorFallback?: (_error: Error, _retry: () => void) => ReactNode;
};

function TableSkeleton() {
    return (
        <div className="grid gap-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-10 w-full" style={{ animationDelay: `${i * 70}ms` }} />
            ))}
        </div>
    );
}

export function QueryPanel<TRow extends object>({
    queryKey,
    request,
    children,
    fallback,
    errorFallback,
}: QueryPanelProps<TRow>) {
    const query = useQuery({ queryKey, queryFn: request });
    const refreshValue = useMemo(
        () =>
            !query.isLoading && !query.isError && query.data !== undefined
                ? {
                      refetch: () => void query.refetch(),
                      isFetching: query.isFetching,
                  }
                : null,
        [query],
    );

    if (query.isLoading) {
        return <QueryRefreshProvider value={null}>{fallback ?? <TableSkeleton />}</QueryRefreshProvider>;
    }

    if (query.isError) {
        const ex = ExceptionCapture.fromUnknown(query.error);
        const error = new Error(ex.displayMessage);
        return (
            <QueryRefreshProvider value={null}>
                {errorFallback?.(error, () => void query.refetch()) ?? (
                    <div className="m-4 rounded-xl bg-error/8 p-4">
                        <p className="text-sm font-semibold text-error">{ex.displayMessage}</p>
                        <Button variant="primary" size="sm" className="mt-3" onClick={() => query.refetch()}>
                            Tentar novamente
                        </Button>
                    </div>
                )}
            </QueryRefreshProvider>
        );
    }

    if (query.data === undefined) return null;

    return (
        <QueryRefreshProvider value={refreshValue}>
            <div className="min-h-0 flex-1 p-1.5">
                {children({ data: query.data, refetch: query.refetch, isFetching: query.isFetching })}
            </div>
        </QueryRefreshProvider>
    );
}

export function QueryTablePanel<TRow extends object>(props: QueryTablePanelProps<TRow>) {
    const {
        queryKey,
        request,
        columns,
        showRefresh,
        fallback,
        errorFallback,
        rowActivateOn = "doubleclick",
        ...tableProps
    } = props;

    return (
        <QueryPanel<TRow>
            queryKey={queryKey}
            request={request}
            showRefresh={showRefresh}
            fallback={fallback}
            errorFallback={errorFallback}
        >
            {({ data }) => (
                <DataTable<TRow>
                    data={sortRowsByCreatedAtDesc(data)}
                    columns={columns}
                    rowActivateOn={rowActivateOn}
                    {...tableProps}
                />
            )}
        </QueryPanel>
    );
}

function filterOptionLabel(col: TableColumnConfig, value: string): string {
    if (col.dataType === TableDataType.BADGE) return formatBadgeCellValue(value, col.badgeLabels);
    return formatCellValue(value, col.dataType);
}

type ColumnFilterHeaderProps = {
    column: TableColumnConfig;
    options: string[];
    value: string[];
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    onChange: (_value: string[]) => void;
};

function ColumnFilterHeader({
    column,
    options,
    value,
    open,
    onOpenChange,
    onChange,
}: ColumnFilterHeaderProps) {
    const active = value.length > 0;
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (!open) return;
        const updatePosition = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (!rect) return;
            setPosition({
                top: rect.bottom + 8,
                left: Math.min(rect.left, window.innerWidth - 304),
            });
        };
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
            onOpenChange(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onOpenChange(false);
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onOpenChange, open]);

    if (!column.filterable) {
        return column.columnName;
    }

    return (
        <div className="relative inline-flex items-center gap-1.5">
            <span>{column.columnName}</span>
            <button
                ref={triggerRef}
                type="button"
                className={clsx(
                    "inline-flex size-5 items-center justify-center rounded-md text-base-content/38 transition-colors hover:bg-base-200 hover:text-primary",
                    active && "text-primary",
                )}
                onClick={(event) => {
                    event.stopPropagation();
                    onOpenChange(!open);
                }}
                aria-label={`Filtrar ${column.columnName}`}
            >
                <Funnel className="size-3.5" />
            </button>
            {open && position
                ? createPortal(
                <div
                    ref={popoverRef}
                    className="fixed z-[400] w-72 rounded-xl border border-[var(--gommo-border-subtle)] bg-base-100 p-3 text-sm text-base-content shadow-lg"
                    style={{ top: position.top, left: position.left }}
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="flex items-center gap-2 border-b border-[var(--gommo-border-subtle)] pb-3">
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-1 text-sm font-medium normal-case tracking-normal text-base-content/75">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm rounded-md border-[var(--gommo-border-strong)]"
                                checked={!active}
                                onChange={() => onChange([])}
                            />
                            <span className="truncate">Selecionar todos</span>
                        </label>
                        <button
                            type="button"
                            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium normal-case tracking-normal text-base-content/45 transition-colors hover:bg-base-200 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                            disabled={!active}
                            onClick={() => onChange([])}
                        >
                            <X className="size-3" />
                            Limpar
                        </button>
                    </div>
                    <div className="mt-2 max-h-64 overflow-y-auto">
                        {options.map((option) => {
                            const checked = value.includes(option);
                            return (
                                <label
                                    key={option}
                                    className="flex cursor-pointer items-center gap-3 border-b border-[var(--gommo-border-subtle)] px-1 py-2.5 text-sm font-normal normal-case tracking-normal text-base-content/75 last:border-b-0 hover:text-base-content"
                                >
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm rounded-md border-[var(--gommo-border-strong)]"
                                        checked={checked}
                                        onChange={() => {
                                            const next = checked
                                                ? value.filter((item) => item !== option)
                                                : [...value, option];
                                            onChange(next.length === options.length ? [] : next);
                                        }}
                                    />
                                    <span className="truncate">{filterOptionLabel(column, option)}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>,
                  document.body,
              )
                : null}
        </div>
    );
}

export function QueryPagedTablePanel<TRow extends object>(props: QueryPagedTablePanelProps<TRow>) {
    const {
        queryKey,
        request,
        columns,
        pageSize = 20,
        pageSizeOptions,
        fallback,
        errorFallback,
        rowActivateOn = "doubleclick",
        ...tableProps
    } = props;
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(pageSize);
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const [openFilterField, setOpenFilterField] = useState<string | null>(null);
    const activeFilterCount = useMemo(
        () => Object.values(filters).filter((value) => value.length > 0).length,
        [filters],
    );
    const query = useQuery({
        queryKey: [...queryKey, "page", page, size, filters],
        queryFn: () => request(page, size, filters),
    });
    const refreshValue = useMemo(
        () =>
            !query.isLoading && !query.isError && query.data !== undefined
                ? {
                      refetch: () => void query.refetch(),
                      isFetching: query.isFetching,
                  }
                : null,
        [query],
    );

    if (query.isLoading) {
        return <QueryRefreshProvider value={null}>{fallback ?? <TableSkeleton />}</QueryRefreshProvider>;
    }

    if (query.isError) {
        const ex = ExceptionCapture.fromUnknown(query.error);
        const error = new Error(ex.displayMessage);
        return (
            <QueryRefreshProvider value={null}>
                {errorFallback?.(error, () => void query.refetch()) ?? (
                    <div className="m-4 rounded-xl bg-error/8 p-4">
                        <p className="text-sm font-semibold text-error">{ex.displayMessage}</p>
                        <Button variant="primary" size="sm" className="mt-3" onClick={() => query.refetch()}>
                            Tentar novamente
                        </Button>
                    </div>
                )}
            </QueryRefreshProvider>
        );
    }

    if (!query.data) return null;

    const updateColumnFilter = (fieldValue: string, value: string[]) => {
        setPage(0);
        setFilters((current) => {
            const next = { ...current };
            if (value.length === 0) {
                delete next[fieldValue];
            } else {
                next[fieldValue] = value;
            }
            return next;
        });
    };
    const clearFilters = () => {
        setPage(0);
        setOpenFilterField(null);
        setFilters({});
    };

    return (
        <QueryRefreshProvider value={refreshValue}>
            <div className="min-h-0 flex-1 p-1.5">
                <div className="overflow-visible rounded-xl border border-[var(--gommo-border-subtle)] bg-base-100 shadow-sm">
                    {activeFilterCount > 0 ? (
                        <div className="flex items-center justify-end border-b border-[var(--gommo-border-subtle)] px-3 py-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<X className="size-3.5" />}
                                onClick={clearFilters}
                            >
                                Limpar filtros
                            </Button>
                        </div>
                    ) : null}
                    <DataTable<TRow>
                        data={query.data.content}
                        columns={columns}
                        rowActivateOn={rowActivateOn}
                        renderColumnHeader={(column) => (
                            <ColumnFilterHeader
                                column={column}
                                options={query.data.filterOptions?.[column.fieldValue] ?? []}
                                value={filters[column.fieldValue] ?? []}
                                open={openFilterField === column.fieldValue}
                                onOpenChange={(open) => setOpenFilterField(open ? column.fieldValue : null)}
                                onChange={(value) => updateColumnFilter(column.fieldValue, value)}
                            />
                        )}
                        {...tableProps}
                    />
                    <TablePagination
                        page={query.data.page}
                        totalPages={query.data.totalPages}
                        totalElements={query.data.totalElements}
                        size={query.data.size}
                        pageSizeOptions={pageSizeOptions}
                        onPageChange={setPage}
                        onPageSizeChange={(nextSize) => {
                            setPage(0);
                            setSize(nextSize);
                        }}
                    />
                </div>
            </div>
        </QueryRefreshProvider>
    );
}
