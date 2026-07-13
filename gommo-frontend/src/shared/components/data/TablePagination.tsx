import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

type TablePaginationProps = {
    page: number;
    totalPages: number;
    totalElements: number;
    size: number;
    mode?: "pages" | "load-more";
    loading?: boolean;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
};

function paginationItems(page: number, totalPages: number): Array<number | "ellipsis"> {
    const safeTotalPages = Math.max(1, totalPages);
    const current = page + 1;
    if (safeTotalPages <= 7) {
        return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
    }
    const items: Array<number | "ellipsis"> = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(safeTotalPages - 1, current + 1);
    if (start > 2) items.push("ellipsis");
    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
        items.push(pageNumber);
    }
    if (end < safeTotalPages - 1) items.push("ellipsis");
    items.push(safeTotalPages);
    return items;
}

export function TablePagination({
    page,
    totalPages,
    totalElements,
    size,
    mode = "pages",
    loading = false,
    pageSizeOptions = [10, 20, 50, 100],
    onPageChange,
    onPageSizeChange,
}: TablePaginationProps) {
    const safeTotalPages = Math.max(1, totalPages);
    const start = totalElements === 0 ? 0 : page * size + 1;
    const end = Math.min((page + 1) * size, totalElements);
    const canGoBack = page > 0;
    const canGoForward = page + 1 < safeTotalPages;
    const pages = paginationItems(page, safeTotalPages);

    if (mode === "load-more") {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--gommo-border-subtle)] bg-base-100 px-4 py-3 text-sm text-base-content/65">
                <span className="whitespace-nowrap">
                    Mostrando {end} de {totalElements} registros
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={loading}
                    disabled={!canGoForward || loading}
                    onClick={() => onPageSizeChange(size + 20)}
                >
                    Carregar mais
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-nowrap items-center justify-between gap-4 border-t border-[var(--gommo-border-subtle)] bg-base-100 px-4 py-3 text-sm text-base-content/65">
            <span className="min-w-0 flex-1 whitespace-nowrap">
                Mostrando {start}-{end} de {totalElements} registros
            </span>
            <div className="flex shrink-0 items-center justify-center gap-1.5">
                <Button type="button" variant="outline" size="sm" disabled={!canGoBack} onClick={() => onPageChange(0)}>
                    Primeiro
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronLeft className="size-4" />}
                    disabled={!canGoBack}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Pagina anterior"
                />
                {pages.map((item, index) =>
                    item === "ellipsis" ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex h-8 min-w-8 items-center justify-center px-1 text-base-content/45"
                            aria-hidden
                        >
                            ...
                        </span>
                    ) : (
                        <Button
                            key={item}
                            type="button"
                            variant={item === page + 1 ? "primary" : "outline"}
                            size="sm"
                            className="min-w-8 px-0 tabular-nums"
                            onClick={() => onPageChange(item - 1)}
                            aria-current={item === page + 1 ? "page" : undefined}
                        >
                            {item}
                        </Button>
                    ),
                )}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronRight className="size-4" />}
                    disabled={!canGoForward}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Proxima pagina"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canGoForward}
                    onClick={() => onPageChange(safeTotalPages - 1)}
                >
                    Último
                </Button>
            </div>
            <label className="flex min-w-0 flex-1 items-center justify-end gap-2 whitespace-nowrap">
                <span>Linhas</span>
                <select
                    className="select select-bordered select-sm h-8 min-h-8 w-20 rounded-lg border-[var(--gommo-border)] bg-base-100 text-sm"
                    value={size}
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
                >
                    {pageSizeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
