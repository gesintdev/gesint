"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAnchoredPanelPosition } from "@/shared/components/ui/input/popover-placement";
import { usePopoverPortalRoot } from "@/shared/components/ui/input/popover-portal";
import { normalizeMonthIso } from "@/shared/lib/input/date";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type MonthPickerPanelProps = {
    value: string;
    min?: string;
    max?: string;
    onPick: (isoDate: string) => void;
    anchorRef: React.RefObject<HTMLElement | null>;
};

export const MonthPickerPanel = forwardRef<HTMLDivElement, MonthPickerPanelProps>(function MonthPickerPanel(
    { value, min, max, onPick, anchorRef },
    ref,
) {
    const selectedYear = value ? Number(value.slice(0, 4)) : new Date().getFullYear();
    const selectedMonth = value ? Number(value.slice(5, 7)) : new Date().getMonth() + 1;
    const portalRoot = usePopoverPortalRoot();
    const panelRef = useRef<HTMLDivElement>(null);
    const box = useAnchoredPanelPosition(true, anchorRef, panelRef, {
        gap: 6,
        width: "content",
        fallbackHeight: 220,
    });
    const setRef = (node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
    };
    const [year, setYear] = useState(selectedYear);
    useEffect(() => {
        setYear(selectedYear);
    }, [selectedYear]);
    if (!portalRoot) return null;
    const isDisabled = (month: number) => {
        const iso = normalizeMonthIso(`${year}-${String(month).padStart(2, "0")}-01`);
        if (min && iso < min) return true;
        if (max && iso > max) return true;
        return false;
    };
    return createPortal(
        <div
            ref={setRef}
            className="gesint-date-picker-panel surface-popover fixed z-200 p-3"
            style={{
                position: "fixed",
                top: box.top,
                left: box.left,
                width: "max-content",
                maxHeight: box.maxHeight ?? undefined,
                overflowY: box.maxHeight != null ? "auto" : undefined,
            }}
            role="dialog"
            aria-label={"Seletor de compet\u00eancia"}
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    aria-label="Ano anterior"
                    onClick={() => setYear((current) => current - 1)}
                >
                    <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-semibold tabular-nums">{year}</span>
                <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    aria-label={"Pr\u00f3ximo ano"}
                    onClick={() => setYear((current) => current + 1)}
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {MONTH_LABELS.map((label, index) => {
                    const month = index + 1;
                    const active = year === selectedYear && month === selectedMonth;
                    const disabled = isDisabled(month);
                    return (
                        <button
                            key={label}
                            type="button"
                            disabled={disabled}
                            className={clsx("btn btn-sm min-w-16", active ? "btn-primary" : "btn-ghost")}
                            onClick={() => onPick(normalizeMonthIso(`${year}-${String(month).padStart(2, "0")}-01`))}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>,
        portalRoot,
    );
});
