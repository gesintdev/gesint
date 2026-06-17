"use client";
import { forwardRef, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { createPortal } from "react-dom";

import { dateToIso, parseIsoToDate } from "@/shared/lib/input/date";

type DatePickerPanelProps = {
    value: string;
    min?: string;
    max?: string;
    onPick: (isoDate: string) => void;
    anchorRef: React.RefObject<HTMLElement | null>;
};

export const DatePickerPanel = forwardRef<HTMLDivElement, DatePickerPanelProps>(function DatePickerPanel(
    { value, min, max, onPick, anchorRef },
    ref,
) {
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
    if (typeof document === "undefined") return null;
    const selected = parseIsoToDate(value);
    const fromDate = parseIsoToDate(min ?? "");
    const toDate = parseIsoToDate(max ?? "");
    return createPortal(
        <div
            ref={ref}
            className="gommo-date-picker-panel surface-popover fixed z-200 p-2"
            style={{
                top: position.top,
                left: position.left,
                width: "max-content",
            }}
            role="dialog"
            aria-label="Calendário"
        >
            <DayPicker
                mode="single"
                locale={ptBR}
                className="react-day-picker border-none"
                selected={selected}
                onSelect={(date) => {
                    if (date) onPick(dateToIso(date));
                }}
                disabled={[fromDate ? { before: fromDate } : undefined, toDate ? { after: toDate } : undefined].filter(
                    (m): m is { before: Date } | { after: Date } => Boolean(m),
                )}
                defaultMonth={selected ?? new Date()}
            />
        </div>,
        document.body,
    );
});
