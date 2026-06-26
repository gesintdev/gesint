"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { forwardRef, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

import { normalizeMonthIso } from "@/shared/lib/input/date";

const MONTH_LABELS = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
];

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
    const [year, setYear] = useState(selectedYear);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        setPosition({
            top: rect.bottom + 6,
            left: rect.left,
        });
    }, [anchorRef]);

    useLayoutEffect(() => {
        updatePosition();
    }, [updatePosition]);

    useEffect(() => {
        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [updatePosition]);

    useEffect(() => {
        setYear(selectedYear);
    }, [selectedYear]);

    if (typeof document === "undefined") return null;

    const isDisabled = (month: number) => {
        const iso = normalizeMonthIso(`${year}-${String(month).padStart(2, "0")}-01`);
        if (min && iso < min) return true;
        if (max && iso > max) return true;
        return false;
    };

    return createPortal(
        <div
            ref={ref}
            className="gommo-date-picker-panel surface-popover fixed z-200 p-3"
            style={{
                top: position.top,
                left: position.left,
                width: "max-content",
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
                            className={clsx(
                                "btn btn-sm min-w-16",
                                active ? "btn-primary" : "btn-ghost",
                            )}
                            onClick={() => onPick(normalizeMonthIso(`${year}-${String(month).padStart(2, "0")}-01`))}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>,
        document.body,
    );
});
