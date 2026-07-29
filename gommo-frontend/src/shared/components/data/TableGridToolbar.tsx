"use client";

import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {Columns3, FileSpreadsheet, RotateCcw} from "lucide-react";
import {useEffect, useId, useRef, useState} from "react";

import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {InputCheckbox} from "@/shared/components/ui/input/InputCheckbox";
import {useClickOutside} from "@/shared/components/ui/input/use-listbox-keyboard";
import type {TableColumnConfig} from "@/shared/types/table.types";

type TableGridToolbarProps = {
    columns: TableColumnConfig[];
    visibleColumnIds: string[];
    onVisibleColumnIdsChange: (_ids: string[]) => void;
    onExportExcel: () => void;
    onClearFilters: () => void;
    canClearFilters: boolean;
    exportDisabled?: boolean;
    className?: string;
};

export function TableGridToolbar({
    columns,
    visibleColumnIds,
    onVisibleColumnIdsChange,
    onExportExcel,
    onClearFilters,
    canClearFilters,
    exportDisabled = false,
    className,
}: TableGridToolbarProps) {
    const [columnsOpen, setColumnsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    useClickOutside(rootRef, () => setColumnsOpen(false), columnsOpen);

    useEffect(() => {
        if (!columnsOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setColumnsOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [columnsOpen]);

    const toggleColumn = (columnId: string, nextChecked: boolean) => {
        if (nextChecked) {
            if (visibleColumnIds.includes(columnId)) return;
            onVisibleColumnIdsChange([...visibleColumnIds, columnId]);
            return;
        }
        if (visibleColumnIds.length <= 1) return;
        onVisibleColumnIdsChange(visibleColumnIds.filter((id) => id !== columnId));
    };

    return (
        <div ref={rootRef} className={clsx("gommo-table-actions gommo-table-grid-toolbar", className)}>
            <div className="relative">
                <TableActionButton
                    type="button"
                    actionVariant="open"
                    aria-label="Escolher colunas visíveis"
                    aria-expanded={columnsOpen}
                    aria-controls={panelId}
                    title="Colunas visíveis"
                    leftIcon={<Columns3 className="size-3.5" />}
                    onClick={() => setColumnsOpen((open) => !open)}
                />
                <AnimatePresence>
                    {columnsOpen ? (
                        <motion.div
                            id={panelId}
                            role="menu"
                            initial={{opacity: 0, y: -5, scale: 0.97}}
                            animate={{opacity: 1, y: 0, scale: 1}}
                            exit={{opacity: 0, y: -5, scale: 0.97}}
                            transition={{duration: 0.18, ease: [0.22, 1, 0.36, 1]}}
                            className="gommo-table-grid-toolbar__panel surface-popover origin-top-right"
                        >
                            <p className="gommo-table-grid-toolbar__panel-title">Colunas visíveis</p>
                            <ul className="gommo-table-grid-toolbar__panel-list">
                                {columns.map((column) => {
                                    const checked = visibleColumnIds.includes(column.id);
                                    const onlyOne = visibleColumnIds.length <= 1 && checked;
                                    return (
                                        <li key={column.id}>
                                            <InputCheckbox
                                                size="xs"
                                                checked={checked}
                                                disabled={onlyOne}
                                                label={column.columnName}
                                                onCheckedChange={(next) => toggleColumn(column.id, next)}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            <TableActionButton
                type="button"
                actionVariant="download"
                aria-label="Exportar para Excel"
                title="Exportar Excel"
                disabled={exportDisabled}
                leftIcon={<FileSpreadsheet className="size-3.5" />}
                onClick={onExportExcel}
            />

            <TableActionButton
                type="button"
                actionVariant="open"
                aria-label="Limpar filtros"
                title="Limpar filtros"
                disabled={!canClearFilters}
                leftIcon={<RotateCcw className="size-3.5" />}
                onClick={onClearFilters}
            />
        </div>
    );
}
