"use client";

import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {Columns3, FileSpreadsheet, RotateCcw} from "lucide-react";
import {useCallback, useEffect, useId, useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {InputCheckbox} from "@/shared/components/ui/input/InputCheckbox";
import {usePopoverPortalRoot} from "@/shared/components/ui/input/popover-portal";
import {useClickOutside} from "@/shared/components/ui/input/use-listbox-keyboard";
import type {TableColumnConfig} from "@/shared/types/table.types";

const PANEL_MIN_WIDTH = 216;
const PANEL_GAP = 8;

type TableGridToolbarProps = {
    columns: TableColumnConfig[];
    visibleColumnIds: string[];
    onVisibleColumnIdsChange: (_ids: string[]) => void;
    onExportExcel: () => void;
    onClearFilters: () => void;
    canClearFilters: boolean;
    exportDisabled?: boolean;
    /** Quando false, oculta o botão Excel. */
    exportVisible?: boolean;
    /** Title do botão Excel (ex.: sem permissão). */
    exportTitle?: string;
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
                                     exportVisible = true,
                                     exportTitle = "Exportar Excel",
                                     className,
                                 }: TableGridToolbarProps) {
    const [columnsOpen, setColumnsOpen] = useState(false);
    const [panelPosition, setPanelPosition] = useState({top: 0, left: 0});
    const rootRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const portalRoot = usePopoverPortalRoot();

    const closeColumns = useCallback(() => setColumnsOpen(false), []);

    const updatePanelPosition = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        const width = Math.max(rect.width, PANEL_MIN_WIDTH);
        const left = Math.min(
            Math.max(PANEL_GAP, rect.right - width),
            window.innerWidth - width - PANEL_GAP,
        );
        setPanelPosition({
            top: rect.bottom + PANEL_GAP,
            left,
        });
    }, []);

    useClickOutside([rootRef, panelRef], closeColumns, columnsOpen);

    useLayoutEffect(() => {
        if (!columnsOpen) return;
        updatePanelPosition();
    }, [columnsOpen, updatePanelPosition]);

    useEffect(() => {
        if (!columnsOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeColumns();
        };
        updatePanelPosition();
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("resize", updatePanelPosition);
        window.addEventListener("scroll", updatePanelPosition, true);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", updatePanelPosition);
            window.removeEventListener("scroll", updatePanelPosition, true);
        };
    }, [closeColumns, columnsOpen, updatePanelPosition]);

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
        <div ref={rootRef}
             className={clsx("gesint-table-actions gesint-table-grid-toolbar", className)}>
            <div ref={anchorRef} className="relative">
                <TableActionButton
                    type="button"
                    actionVariant="open"
                    aria-label="Escolher colunas visíveis"
                    aria-expanded={columnsOpen}
                    aria-controls={panelId}
                    title="Colunas visíveis"
                    leftIcon={<Columns3 className="size-3.5"/>}
                    onClick={() => setColumnsOpen((open) => !open)}
                />
                {portalRoot
                    ? createPortal(
                          <AnimatePresence>
                              {columnsOpen ? (
                                  <motion.div
                                      ref={panelRef}
                                      id={panelId}
                                      role="menu"
                                      initial={{opacity: 0, y: -5, scale: 0.97}}
                                      animate={{opacity: 1, y: 0, scale: 1}}
                                      exit={{opacity: 0, y: -5, scale: 0.97}}
                                      transition={{duration: 0.18, ease: [0.22, 1, 0.36, 1]}}
                                      className="gesint-table-grid-toolbar__panel surface-popover fixed z-200 origin-top-right"
                                      style={{
                                          top: panelPosition.top,
                                          left: panelPosition.left,
                                          minWidth: PANEL_MIN_WIDTH,
                                      }}
                                  >
                                      <p className="gesint-table-grid-toolbar__panel-title">Colunas visíveis</p>
                                      <ul className="gesint-table-grid-toolbar__panel-list">
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
                                                          className={"px-2 py-2 rounded-(--gesint-radius) hover:bg-(--color-base-300)"}
                                                          onCheckedChange={(next) => toggleColumn(column.id, next)}
                                                      />
                                                  </li>
                                              );
                                          })}
                                      </ul>
                                  </motion.div>
                              ) : null}
                          </AnimatePresence>,
                          portalRoot,
                      )
                    : null}
            </div>

            {exportVisible ? (
                <TableActionButton
                    type="button"
                    actionVariant="download"
                    aria-label="Exportar para Excel"
                    title={exportTitle}
                    disabled={exportDisabled}
                    leftIcon={<FileSpreadsheet className="size-3.5"/>}
                    onClick={onExportExcel}
                />
            ) : null}

            <TableActionButton
                type="button"
                actionVariant="open"
                aria-label="Limpar filtros"
                title="Limpar filtros"
                disabled={!canClearFilters}
                leftIcon={<RotateCcw className="size-3.5"/>}
                onClick={onClearFilters}
            />
        </div>
    );
}
