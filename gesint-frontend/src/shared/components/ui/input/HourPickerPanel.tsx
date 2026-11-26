"use client";

import clsx from "clsx";
import { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAnchoredPanelPosition } from "@/shared/components/ui/input/popover-placement";
import { usePopoverPortalRoot } from "@/shared/components/ui/input/popover-portal";
import { joinTime, splitTime } from "@/shared/lib/input/date";
import { HOUR_ITEMS, MINUTE_ITEMS } from "@/shared/lib/input/time";

type HourPickerPanelProps = {
    value: string;
    onPick: (time: string) => void;
    anchorRef: React.RefObject<HTMLElement | null>;
    /**
     * `start` — borda esquerda do painel alinhada à esquerda do âncora (padrão).
     * `end` — borda direita do painel alinhada à direita do âncora (abre para a esquerda).
     */
    align?: "start" | "end";
};

export const HourPickerPanel = forwardRef<HTMLDivElement, HourPickerPanelProps>(function HourPickerPanel(
    { value, onPick, anchorRef, align = "start" },
    ref,
) {
    const parsed = splitTime(value);
    const [draftHour, setDraftHour] = useState(parsed.hour || "08");
    const [draftMinute, setDraftMinute] = useState(parsed.minute || "00");
    const portalRoot = usePopoverPortalRoot();
    const panelRef = useRef<HTMLDivElement>(null);
    const box = useAnchoredPanelPosition(true, anchorRef, panelRef, {
        gap: 6,
        align,
        width: "anchor",
        minWidth: 220,
        fallbackHeight: 280,
    });
    const setRef = (node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
    };

    useEffect(() => {
        const { hour, minute } = splitTime(value);
        setDraftHour(hour || "08");
        setDraftMinute(minute || "00");
    }, [value]);

    if (!portalRoot) return null;

    const commit = (hour: string, minute: string) => {
        const next = joinTime(hour, minute);
        if (next) onPick(next);
    };

    return createPortal(
        <div
            ref={setRef}
            className="gesint-hour-picker-panel surface-popover fixed z-200 overflow-hidden"
            style={{
                position: "fixed",
                top: box.top,
                left: box.left,
                width: box.width,
                maxHeight: box.maxHeight ?? undefined,
                overflowY: box.maxHeight != null ? "auto" : undefined,
            }}
            role="dialog"
            aria-label="Selecionar hora"
        >
            <div className="grid grid-cols-2 gap-px bg-[var(--gesint-border-subtle)]">
                <TimeColumn
                    label="Hora"
                    items={HOUR_ITEMS}
                    value={draftHour}
                    onPick={(hour) => {
                        setDraftHour(hour);
                        commit(hour, draftMinute);
                    }}
                />
                <TimeColumn
                    label="Minuto"
                    items={MINUTE_ITEMS}
                    value={draftMinute}
                    onPick={(minute) => {
                        setDraftMinute(minute);
                        commit(draftHour, minute);
                    }}
                />
            </div>
        </div>,
        portalRoot,
    );
});
function TimeColumn({
    label,
    items,
    value,
    onPick,
}: {
    label: string;
    items: { value: string; label: string }[];
    value: string;
    onPick: (v: string) => void;
}) {
    return (
        <div className="flex max-h-48 flex-col bg-[var(--color-base-100)]">
            <p className="shrink-0 border-b border-[var(--gesint-border-subtle)] px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-base-content/50">
                {label}
            </p>
            <ul className="overflow-y-auto py-1" role="listbox" aria-label={label}>
                {items.map((item) => {
                    const active = item.value === value;
                    return (
                        <li key={item.value}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={active}
                                className={clsx(
                                    "w-full px-3 py-1.5 text-center text-sm transition-colors",
                                    active ? "bg-primary font-semibold text-primary-content" : "hover:bg-base-200",
                                )}
                                onClick={() => onPick(item.value)}
                            >
                                {item.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
