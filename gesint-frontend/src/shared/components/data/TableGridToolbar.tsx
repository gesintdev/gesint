"use client";

import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {Columns3, FileSpreadsheet, RotateCcw} from "lucide-react";
import {useCallback, useEffect, useId, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {InputCheckbox} from "@/shared/components/ui/input/InputCheckbox";
import {useAnchoredPanelPosition} from "@/shared/components/ui/input/popover-placement";
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
    const rootRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const portalRoot = usePopoverPortalRoot();
    const panelBox = useAnchoredPanelPosition(columnsOpen, anchorRef, panelRef, {
        gap: PANEL_GAP,
        align: "end",
        width: "content",
        minWidth: PANEL_MIN_WIDTH,
        fallbackHeight: 280,
    });

    const closeColumns = useCallback(() => setColumnsOpen(false), []);

    useClickOutside([rootRef, panelRef], closeColumns, columnsOpen);

    useEffect(() => {
        if (!columnsOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeColumns();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [closeColumns, columnsOpen]);

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
                                      className={clsx(
                                          "gesint-table-grid-toolbar__panel surface-popover fixed z-200",
                                          panelBox.openUp ? "origin-bottom-right" : "origin-top-right",
                                      )}
                                      style={{
                                          position: "fixed",
                                          top: panelBox.top,
                                          left: panelBox.left,
                                          minWidth: PANEL_MIN_WIDTH,
                                          maxHeight: panelBox.maxHeight ?? undefined,
                                          overflowY: panelBox.maxHeight != null ? "auto" : undefined,
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
