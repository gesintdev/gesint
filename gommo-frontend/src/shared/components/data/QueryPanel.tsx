"use client";

import {useQuery, type QueryKey, type UseQueryResult} from "@tanstack/react-query";
import {useMemo, type ReactNode} from "react";
import {ExceptionCapture} from "@/shared/exceptions";
import {Button} from "@/shared/components/ui/Button";
import {DataTable, type DataTableRowActivateOn} from "@/shared/components/ui/DataTable";
import type {TableColumnConfig} from "@/shared/types/table.types";
import {QueryRefreshProvider} from "@/shared/components/data/QueryRefreshContext";

/** Props do render prop de {@link QueryPanel} (lista: `data` é sempre `TRow[]`). */
export type QueryPanelRenderProps<TRow> = {
    data: TRow[];
    refetch: UseQueryResult<TRow[]>["refetch"];
    isFetching: boolean;
};

type QueryPanelProps<TRow extends object> = {
    queryKey: QueryKey;
    request: () => Promise<TRow[]>;
    children: (props: QueryPanelRenderProps<TRow>) => ReactNode;
    fallback?: ReactNode;
    errorFallback?: (error: Error, retry: () => void) => ReactNode;
    showRefresh?: boolean;
};

/** Props da tabela repassadas ao {@link DataTable} (sem `data` / `columns`). */
export type QueryTablePanelTableProps<TRow extends object> = {
    rowKey?: string;
    emptyMessage?: string;
    compact?: boolean;
    striped?: boolean;
    stickyHeader?: boolean;
    onRowActivate?: (row: TRow) => void;
    rowActivateOn?: DataTableRowActivateOn;
    /** @deprecated Use `onRowActivate` + `rowActivateOn="click"` */
    onRowClick?: (row: TRow) => void;
    /** @deprecated Use `onRowActivate` + `rowActivateOn="doubleclick"` */
    onRowDoubleClick?: (row: TRow) => void;
    renderActions?: (row: TRow) => ReactNode;
    actionsHeader?: string;
    actionsClassName?: string;
};

/** QueryPanel + DataTable — `onRowActivate` e demais props de tabela vão aqui. */
export type QueryTablePanelProps<TRow extends object> = QueryTablePanelTableProps<TRow> & {
    queryKey: QueryKey;
    request: () => Promise<TRow[]>;
    columns: TableColumnConfig[];
    showRefresh?: boolean;
    fallback?: ReactNode;
    errorFallback?: (error: Error, retry: () => void) => ReactNode;
};

function TableSkeleton() {
    return (
        <div className="grid gap-2 p-5">
            {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-10 w-full" style={{animationDelay: `${i * 70}ms`}}/>
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
                                                    showRefresh = false,
                                                }: QueryPanelProps<TRow>) {
    const query = useQuery({queryKey, queryFn: request});

    const refreshValue = useMemo(
        () =>
            !query.isLoading && !query.isError && query.data !== undefined
                ? {
                    refetch: () => void query.refetch(),
                    isFetching: query.isFetching,
                }
                : null,
        [query.data, query.isError, query.isFetching, query.isLoading, query.refetch],
    );

    if (query.isLoading) {
        return <QueryRefreshProvider value={null}>{fallback ?? <TableSkeleton/>}</QueryRefreshProvider>;
    }

    if (query.isError) {
        const ex = ExceptionCapture.fromUnknown(query.error);
        const error = new Error(ex.displayMessage);
        return (
            <QueryRefreshProvider value={null}>
                {errorFallback?.(error, () => void query.refetch()) ?? (
                    <div className="m-5 rounded-xl bg-error/8 p-5">
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
            <div className="min-h-0 flex-1 p-2">
                {children({data: query.data, refetch: query.refetch, isFetching: query.isFetching})}
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
            {({data}) => (
                <DataTable<TRow>
                    data={data}
                    columns={columns}
                    rowActivateOn={rowActivateOn}
                    {...tableProps}
                />
            )}
        </QueryPanel>
    );
}
