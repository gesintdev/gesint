"use client";

import {type QueryKey, useQuery, type UseQueryResult} from "@tanstack/react-query";
import {usePathname} from "next/navigation";
import {type ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {toast} from "sonner";

import {ColumnFilterControl} from "@/shared/components/data/ColumnFilterControl";
import {useRegisterQueryRefresh} from "@/shared/components/data/QueryRefreshContext";
import {useBranchScopedQueryKey} from "@/shared/hooks/useBranchScopedQueryKey";
import {TableGridToolbar} from "@/shared/components/data/TableGridToolbar";
import {TablePagination} from "@/shared/components/data/TablePagination";
import {Button} from "@/shared/components/ui/Button";
import {DataTable, type DataTableRowActivateOn} from "@/shared/components/ui/DataTable";
import type {PageableResponseDto} from "@/shared/dto/pageable.dto";
import {ExceptionCapture} from "@/shared/exceptions";
import {apiFetch} from "@/shared/lib/api.client";
import {exportTableToExcel} from "@/shared/lib/table/export-table-excel";
import {sortRowsByCreatedAtDesc} from "@/shared/lib/table/sort-rows-by-created-at";
import {isColumnFilterable, type TableColumnConfig} from "@/shared/types/table.types";
import {deriveExportPermission, hasPermission, useSessionPermissions} from "@/shared/auth/permissions";
import {findRouteByPathname} from "@/shared/auth/route-permissions";

const EMPTY_FILTERS: Record<string, string[]> = {};

function filtersEqual(left: Record<string, string[]>, right: Record<string, string[]>): boolean {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of keys) {
        const a = left[key] ?? [];
        const b = right[key] ?? [];
        if (a.length !== b.length) return false;
        if (a.some((value, index) => value !== b[index])) return false;
    }
    return true;
}

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
    /** Filtros iniciais das colunas (ex.: status ACTIVE). “Limpar filtros” restaura este valor. */
    initialFilters?: Record<string, string[]>;
    /** Nome base do arquivo Excel (sem extensão). */
    exportFileName?: string;
    /**
     * Authority exigida para exportar (`modulo:export`).
     * Se omitida, deriva da rota ativa (`route.permission` → `modulo:export`).
     */
    exportPermission?: string;
    paginationMode?: "pages" | "load-more";
    pageSize?: number;
    pageSizeOptions?: number[];
    fallback?: ReactNode;
    errorFallback?: (_error: Error, _retry: () => void) => ReactNode;
};

function TableSkeleton() {
    return (
        <div className="grid gap-2 p-4">
            {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-10 w-full" style={{animationDelay: `${i * 70}ms`}}/>
            ))}
        </div>
    );
}

function useQueryPanelRefresh(query: Pick<UseQueryResult, "refetch" | "isFetching">) {
    const refetchRef = useRef(query.refetch);
    refetchRef.current = query.refetch;
    const refreshState = useMemo(
        () => ({
            refetch: () => {
                void refetchRef.current();
            },
            isFetching: query.isFetching,
        }),
        [query.isFetching],
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
    const scopedQueryKey = useBranchScopedQueryKey(queryKey);
    const query = useQuery({queryKey: scopedQueryKey, queryFn: request});
    useQueryPanelRefresh(query);

    if (query.isLoading) {
        return <>{fallback ?? <TableSkeleton/>}</>;
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
            {children({data: query.data, refetch: query.refetch, isFetching: query.isFetching})}
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
            {({data}) => (
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
        <div className="flex min-w-[5.5rem] flex-col gap-1.5 sm:min-w-[7.5rem]">
            <span className="gommo-table-col-title">{column.columnName}</span>
            {isColumnFilterable(column) ? (
                <div
                    className="gommo-column-filter-host"
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                >
                    <ColumnFilterControl column={column} options={options} value={value} onChange={onChange}/>
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
        initialFilters = EMPTY_FILTERS,
        exportFileName = "exportacao",
        exportPermission: exportPermissionProp,
        paginationMode = "pages",
        pageSize = 20,
        pageSizeOptions,
        fallback,
        errorFallback,
        rowActivateOn = "doubleclick",
        ...tableProps
    } = props;
    const pathname = usePathname();
    const permissions = useSessionPermissions();
    const resolvedExportPermission = useMemo(() => {
        if (exportPermissionProp) return exportPermissionProp;
        const route = findRouteByPathname(pathname);
        return deriveExportPermission(route?.permission);
    }, [exportPermissionProp, pathname]);
    const canExport =
        resolvedExportPermission == null
            ? true
            : hasPermission(permissions, resolvedExportPermission);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(pageSize);
    const [filters, setFilters] = useState<Record<string, string[]>>(() => ({...initialFilters}));
    const [exporting, setExporting] = useState(false);
    const columnIdsKey = columns.map((column) => column.id).join("|");
    const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => columns.map((column) => column.id));
    const didMountRef = useRef(false);
    const canClearFilters = useMemo(() => !filtersEqual(filters, initialFilters), [filters, initialFilters]);
    const visibleColumns = useMemo(
        () => columns.filter((column) => visibleColumnIds.includes(column.id)),
        [columns, visibleColumnIds],
    );
    const scopedQueryKey = useBranchScopedQueryKey(queryKey);
    const query = useQuery({
        queryKey: [...scopedQueryKey, "page", page, size, filters, baseFilters],
        queryFn: () => request(page, size, {...baseFilters, ...filters}),
    });
    useQueryPanelRefresh(query);

    useEffect(() => {
        const nextIds = columnIdsKey ? columnIdsKey.split("|") : [];
        setVisibleColumnIds((current) => {
            const retained = current.filter((id) => nextIds.includes(id));
            return retained.length > 0 ? retained : nextIds;
        });
    }, [columnIdsKey]);

    // Base filters come from external segmented chips; changing them should start a fresh feed.
    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }
        setPage(0);
        setSize(pageSize);
        setFilters({...initialFilters});
    }, [baseFilters, initialFilters, pageSize]);

    if (query.isLoading) {
        return <>{fallback ?? <TableSkeleton/>}</>;
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
            const next = {...current};
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
        setFilters({...initialFilters});
    };

    const handleExportExcel = async () => {
        if (!canExport || exporting || visibleColumns.length === 0) return;
        setExporting(true);
        try {
            const mergedFilters = {...baseFilters, ...filters};
            const total = Math.max(query.data.totalElements, 1);
            const result = await request(0, total, mergedFilters);
            exportTableToExcel({
                rows: result.content,
                columns: visibleColumns,
                fileName: exportFileName,
            });
            if (resolvedExportPermission) {
                try {
                    await apiFetch("/api/v1/audit-trail/exports", {
                        method: "POST",
                        body: {
                            exportPermission: resolvedExportPermission,
                            fileName: exportFileName,
                            rowCount: result.content.length,
                        },
                    });
                } catch {
                    // Exportação já concluída; falha só no registro não bloqueia o download.
                }
            }
            toast.success("Planilha exportada");
        } catch (err: unknown) {
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível exportar a planilha."});
        } finally {
            setExporting(false);
        }
    };

    const toolbarSlot = (
        <TableGridToolbar
            columns={columns}
            visibleColumnIds={visibleColumnIds}
            onVisibleColumnIdsChange={setVisibleColumnIds}
            onExportExcel={() => void handleExportExcel()}
            onClearFilters={clearFilters}
            canClearFilters={canClearFilters}
            exportDisabled={!canExport || exporting || visibleColumns.length === 0}
            exportTitle={canExport ? "Exportar Excel" : "Sem permissão para exportar"}
        />
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col p-1.5">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-(--gommo-border-subtle) bg-base-100 shadow-sm">
                <div className="min-h-0 flex-1 overflow-auto">
                    <DataTable<TRow>
                        data={query.data.content}
                        columns={visibleColumns}
                        rowActivateOn={rowActivateOn}
                        actionsFilterSlot={toolbarSlot}
                        showActionsColumn
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
                </div>
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
