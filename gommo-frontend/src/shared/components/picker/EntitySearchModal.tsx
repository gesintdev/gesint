"use client";

import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/InputString";
import { DataTable } from "@/shared/components/ui/DataTable";
import type {
    EntityPickerAdvancedSearch,
    EntityPickerFilterField,
    EntityPickerSearchParams,
} from "@/shared/types/entity-picker.types";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions/exception-capture";

type EntitySearchModalProps<T extends object> = {
    open: boolean;
    config: EntityPickerAdvancedSearch<T>;
    onClose: () => void;
    onSelect: (item: SelectItem) => void;
    /** Filtros fixos aplicados a toda busca (ex.: departmentId) */
    fixedFilters?: Record<string, string>;
};

function emptyFilters(fields: EntityPickerFilterField[]): Record<string, string> {
    return Object.fromEntries(fields.map((field) => [field.id, ""]));
}

export function EntitySearchModal<T extends object>({
    open,
    config,
    onClose,
    onSelect,
    fixedFilters,
}: EntitySearchModalProps<T>) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const pageSize = config.pageSize ?? 10;

    const [mounted, setMounted] = useState(false);
    const [filters, setFilters] = useState<Record<string, string>>(() => emptyFilters(config.filters));
    const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(() => emptyFilters(config.filters));
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState<T[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    const mergedFilters = useMemo(
        () => ({ ...appliedFilters, ...fixedFilters }),
        [appliedFilters, fixedFilters],
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) dialog.showModal();
        else if (dialog.open) dialog.close();
    }, [open]);

    const runSearch = useCallback(
        async (nextPage: number, nextFilters: Record<string, string>) => {
            setLoading(true);
            try {
                const params: EntityPickerSearchParams = {
                    page: nextPage,
                    size: pageSize,
                    filters: { ...nextFilters, ...fixedFilters },
                };
                const result = await config.search(params);
                setRows(result.content);
                setPage(result.page);
                setTotalPages(result.totalPages);
                setTotalElements(result.totalElements);
            } catch (error) {
                ExceptionCapture.handle(error, {
                    fallbackMessage: "Não foi possível carregar os resultados.",
                });
                setRows([]);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        },
        [config, fixedFilters, pageSize],
    );

    useEffect(() => {
        if (!open) return;
        const initial = emptyFilters(config.filters);
        setFilters(initial);
        setAppliedFilters(initial);
        setPage(0);
        void runSearch(0, initial);
    }, [open, config.filters, runSearch]);

    const handleApplyFilters = () => {
        setAppliedFilters({ ...filters });
        void runSearch(0, filters);
    };

    const handleSelectRow = (row: T) => {
        onSelect(config.toSelectItem(row));
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-box flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/8 px-5 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-base-content">{config.title}</h3>
                        <p className="mt-0.5 text-xs text-base-content/50">
                            {config.selectHint ?? "Dê duplo clique na linha para selecionar"}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div
                    role="search"
                    className="border-b border-base-content/8 px-5 py-4"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyFilters();
                        }
                    }}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        {config.filters.map((field) => (
                            <InputString
                                key={field.id}
                                label={field.label}
                                placeholder={field.placeholder}
                                value={filters[field.id] ?? ""}
                                onValueChange={(value) =>
                                    setFilters((prev) => ({ ...prev, [field.id]: value }))
                                }
                            />
                        ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button
                            type="button"
                            size="sm"
                            leftIcon={<Search className="size-3.5" />}
                            loading={loading}
                            onClick={handleApplyFilters}
                        >
                            Pesquisar
                        </Button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
                    {loading && rows.length === 0 ? (
                        <div className="flex items-center justify-center py-16 text-sm text-base-content/45">
                            <Loader2 className="me-2 size-4 animate-spin" />
                            Carregando...
                        </div>
                    ) : (
                        <DataTable<T>
                            data={rows}
                            columns={config.columns}
                            rowKey="id"
                            emptyMessage={config.emptyMessage ?? "Nenhum registro encontrado."}
                            onRowActivate={handleSelectRow}
                            rowActivateOn="doubleclick"
                            stickyHeader={false}
                        />
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-base-content/8 px-5 py-3">
                    <p className="text-xs text-base-content/45">
                        {totalElements > 0
                            ? `${totalElements} registro(s) · página ${page + 1} de ${Math.max(totalPages, 1)}`
                            : "Nenhum resultado"}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={loading || page <= 0}
                            leftIcon={<ChevronLeft className="size-3.5" />}
                            onClick={() => void runSearch(page - 1, mergedFilters)}
                        >
                            Anterior
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={loading || page + 1 >= totalPages}
                            leftIcon={<ChevronRight className="size-3.5" />}
                            onClick={() => void runSearch(page + 1, mergedFilters)}
                        >
                            Próxima
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
            <button
                type="button"
                className="modal-backdrop"
                aria-label="Fechar modal"
                onClick={onClose}
            />
        </dialog>,
        document.body,
    );
}
