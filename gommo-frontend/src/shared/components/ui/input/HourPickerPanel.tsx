"use client";

import clsx from "clsx";
import { forwardRef, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

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
    const [position, setPosition] = useState({ top: 0, left: 0, width: 220 });

    useEffect(() => {
        const { hour, minute } = splitTime(value);
        setDraftHour(hour || "08");
        setDraftMinute(minute || "00");
    }, [value]);

    const updatePosition = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        const width = Math.max(rect.width, 220);
        const left = align === "end" ? rect.right - width : rect.left;
        setPosition({
            top: rect.bottom + 6,
            left,
            width,
        });
    }, [align, anchorRef]);

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

    const commit = (hour: string, minute: string) => {
        const next = joinTime(hour, minute);
        if (next) onPick(next);
    };

    return createPortal(
        <div
            ref={ref}
            className="gommo-hour-picker-panel surface-popover fixed z-200 overflow-hidden"
            style={{
                top: position.top,
                left: position.left,
                width: position.width,
            }}
            role="dialog"
            aria-label="Selecionar hora"
        >
            <div className="grid grid-cols-2 gap-px bg-[var(--gommo-border-subtle)]">
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
        document.body,
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
            <p className="shrink-0 border-b border-[var(--gommo-border-subtle)] px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-base-content/50">
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
