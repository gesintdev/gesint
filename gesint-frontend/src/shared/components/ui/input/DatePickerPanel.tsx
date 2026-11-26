"use client";

import { forwardRef, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { createPortal } from "react-dom";

import { useAnchoredPanelPosition } from "@/shared/components/ui/input/popover-placement";
import { usePopoverPortalRoot } from "@/shared/components/ui/input/popover-portal";
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
    const portalRoot = usePopoverPortalRoot();
    const panelRef = useRef<HTMLDivElement>(null);
    const box = useAnchoredPanelPosition(true, anchorRef, panelRef, {
        gap: 6,
        width: "content",
        fallbackHeight: 320,
    });
    const setRef = (node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
    };
    if (!portalRoot) return null;
    const selected = parseIsoToDate(value);
    const fromDate = parseIsoToDate(min ?? "");
    const toDate = parseIsoToDate(max ?? "");
    return createPortal(
        <div
            ref={setRef}
            className="gesint-date-picker-panel surface-popover fixed z-200 p-2"
            style={{
                position: "fixed",
                top: box.top,
                left: box.left,
                width: "max-content",
                maxHeight: box.maxHeight ?? undefined,
                overflowY: box.maxHeight != null ? "auto" : undefined,
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
        portalRoot,
    );
});
