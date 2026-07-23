import { type QueryKey, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { ColumnFilterControl } from "@/shared/components/data/ColumnFilterControl";
import { useRegisterQueryRefresh } from "@/shared/components/data/QueryRefreshContext";
import { TablePagination } from "@/shared/components/data/TablePagination";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableRowActivateOn } from "@/shared/components/ui/DataTable";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import { ExceptionCapture } from "@/shared/exceptions";
import { sortRowsByCreatedAtDesc } from "@/shared/lib/table/sort-rows-by-created-at";
import { isColumnFilterable, type TableColumnConfig } from "@/shared/types/table.types";

const EMPTY_FILTERS: Record<string, string[]> = {};

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
    baseFilters?: Record<string, string[]>;
    paginationMode?: "pages" | "load-more";
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

function useQueryPanelRefresh(query: Pick<UseQueryResult, "refetch" | "isFetching">) {
    const refreshState = useMemo(
        () => ({
            refetch: () => {
                void query.refetch();
            },
            isFetching: query.isFetching,
        }),
        [query.isFetching, query.refetch],
    );
    useRegisterQueryRefresh(refreshState);
}

export function QueryPanel<TRow extends object>({
    queryKey,
    request,
    children,
    fallback,
    errorFallback,
}: QueryPanelProps<TRow>) {
    const query = useQuery({ queryKey, queryFn: request });
    useQueryPanelRefresh(query);

    if (query.isLoading) {
        return <>{fallback ?? <TableSkeleton />}</>;
    }

    if (query.isError) {
        const ex = ExceptionCapture.fromUnknown(query.error);
        const error = new Error(ex.displayMessage);
        return (
            errorFallback?.(error, () => void query.refetch()) ?? (
                <div className="m-4 rounded-xl bg-error/8 p-4">
                    <p className="text-sm font-semibold text-error">{ex.displayMessage}</p>
                    <Button variant="primary" size="sm" className="mt-3" onClick={() => query.refetch()}>
                        Tentar novamente
                    </Button>
                </div>
            )
        );
    }

    if (query.data === undefined) return null;

    return (
        <div className="min-h-0 flex-1 p-1.5">
            {children({ data: query.data, refetch: query.refetch, isFetching: query.isFetching })}
        </div>
    );
}

export function QueryTablePanel<TRow extends object>(props: QueryTablePanelProps<TRow>) {
    const {
        queryKey,
        request,
        columns,
        showRefresh: _showRefresh,
        fallback,
        errorFallback,
        rowActivateOn = "doubleclick",
        ...tableProps
    } = props;

    return (
        <QueryPanel<TRow>
            queryKey={queryKey}
            request={request}
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

function ColumnHeaderWithFilter({
    column,
    options,
    value,
    onChange,
}: {
    column: TableColumnConfig;
    options: string[];
    value: string[];
    onChange: (_value: string[]) => void;
}) {
    return (
        <div className="flex min-w-[7.5rem] flex-col gap-1.5">
            <span className="gommo-table-col-title">{column.columnName}</span>
            {isColumnFilterable(column) ? (
                <div
                    className="gommo-column-filter-host"
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                >
                    <ColumnFilterControl column={column} options={options} value={value} onChange={onChange} />
                </div>
            ) : null}
        </div>
    );
}

export function QueryPagedTablePanel<TRow extends object>(props: QueryPagedTablePanelProps<TRow>) {
    const {
        queryKey,
        request,
        columns,
        baseFilters = EMPTY_FILTERS,
        paginationMode = "pages",
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
    const didMountRef = useRef(false);
    const activeFilterCount = useMemo(
        () => Object.values(filters).filter((value) => value.length > 0).length,
        [filters],
    );
    const query = useQuery({
        queryKey: [...queryKey, "page", page, size, filters, baseFilters],
        queryFn: () => request(page, size, { ...baseFilters, ...filters }),
        placeholderData: (previousData) => previousData,
    });
    useQueryPanelRefresh(query);

    // Base filters come from external segmented chips; changing them should start a fresh feed.
    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }
        setPage(0);
        setSize(pageSize);
        setFilters({});
    }, [baseFilters, pageSize]);

    if (query.isLoading) {
        return <>{fallback ?? <TableSkeleton />}</>;
    }

    if (query.isError) {
        const ex = ExceptionCapture.fromUnknown(query.error);
        const error = new Error(ex.displayMessage);
        return (
            errorFallback?.(error, () => void query.refetch()) ?? (
                <div className="m-4 rounded-xl bg-error/8 p-4">
                    <p className="text-sm font-semibold text-error">{ex.displayMessage}</p>
                    <Button variant="primary" size="sm" className="mt-3" onClick={() => query.refetch()}>
                        Tentar novamente
                    </Button>
                </div>
            )
        );
    }

    if (!query.data) return null;

    const updateColumnFilter = (fieldValue: string, value: string[]) => {
        setPage(0);
        setSize(pageSize);
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
        setSize(pageSize);
        setFilters({});
    };

    return (
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
                        <ColumnHeaderWithFilter
                            column={column}
                            options={query.data.filterOptions?.[column.fieldValue] ?? []}
                            value={filters[column.fieldValue] ?? []}
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
                    mode={paginationMode}
                    loading={query.isFetching}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={setPage}
                    onPageSizeChange={(nextSize) => {
                        setPage(0);
                        setSize(nextSize);
                    }}
                />
            </div>
        </div>
    );
}
